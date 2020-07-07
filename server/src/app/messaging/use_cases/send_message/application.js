const Application = require('../../../../core/Application');
const Guard = require('../../../../core/Guard');
const relationshipService = require('../../services/relationshipService');
const SendMessageErrors = require('./errors');
const Message = require('../../domain/message');
const MessageText = require('../../domain/messageText');

class SendMessageApplication extends Application
{
  constructor(messageRepo, channelRepo, userRepo)
  {
    super();
    this._messageRepo = messageRepo;
    this._channelRepo = channelRepo;
    this._userRepo = userRepo;
  }

  /**
   * Sends a message in a channel
   * @param {Object} input 
   * @param {string} input.thisAccountId
   * @param {string} input.channelId
   * @param {string} input.text
   */
  async run(input)
  {
    Guard.againstNull(input.thisAccountId);
    const [thisUser, channel] = await Promise.all([
      this._userRepo.findById(input.thisAccountId),
      this._channelRepo.findById(input.channelId),
    ]);
    if (!channel || !channel.hasUserId(thisUser.id))
    {
      return this.failed(SendMessageErrors.ChannelDoesNotExist, 'A channel with that id doesn\'t exist.');
    }

    const allUsers = await this._userRepo.findByIds(channel.participantIds);
    // dont allow users to dm people with closed dms or people who are blocked
    if (channel.type === 0)
    {
      let bothDmsAreOpen = true;
      allUsers.forEach((user) => {
        if (!user.openDms)
        {
          bothDmsAreOpen = false;
        }
      });
      if ((!bothDmsAreOpen && await relationshipService.areFriends(allUsers[0], allUsers[1]))
      || await relationshipService.hasBlock(allUsers[0], allUsers[1]))
      {
        return this.failed(SendMessageErrors.DmsAreNotOpen, 'Either you or your recipient don\'t allow dms from non-friends.');    
      }
    }

    // create message
    const messageTextResult = MessageText.make(input.text);
    if (messageTextResult.failed)
    {
      return this.failed(SendMessageErrors.InvalidFields, messageTextResult.error);
    }
    const messageText = messageTextResult.value;
    const messageResult = Message.make({ authorId: thisUser.id, channelId: channel.id, text: messageText });
    if (messageResult.failed)
    {
      return this.failed();
    }
    const message = messageResult.value;

    if ((channel.type === 0 || channel.type === 1))
    {
      // add to dm list if not added
      let userDmsHaveBeenUpdated = false;
      allUsers.forEach((user) => {
        if (!user.dmIds.includes(channel.id))
        {
          userDmsHaveBeenUpdated = true;
          user.addDmId(channel.id);
        }
      });

      if (userDmsHaveBeenUpdated)
      {
        await Promise.all([
          this._userRepo.saveMany(allUsers),
          this._messageRepo.save(message),
        ]);
      }
      else
      {
        // change back
        await Promise.all([
          this._userRepo.saveMany(allUsers),
          this._messageRepo.save(message),
        ]);
      }
    }
    else
    {
      await this._messageRepo.save(message);
    }



    return this.ok();
  }
}

module.exports = SendMessageApplication;