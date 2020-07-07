const Entity = require('../../../core/Entity');
const Guard = require('../../../core/Guard');
const Result = require('../../../core/Result');

class Channel extends Entity
{
  get title()
  {
    return this._value.title;
  }

  get type()
  {
    return this._value.type;
  }

  get participantIds()
  {
    return this._value.participantIds;
  }

  changeCreatorId(accountId)
  {
    this._value.creator = accountId;
  }

  changeName(newName)
  {
    if (this._value.type !== 0)
    {
      this._value.creator = newName;
    }
  }

  hasUserId(userId)
  {
    return this._value.participantIds.includes(userId);
  }
}

function uniqueParticipants(participants)
{
  const participantCounts = {};
  for (let i = 0; i < participants.length; i++)
  {
    const id = participants[i];
    if (!participantCounts[id])
    {
      participantCounts[id] = true;
    }
    else
    {
      return false;
    }
  }
  return true;
}

/**
 * @param {Object} props 
 * @param {string} props.id
 * @param {[string]} props.participantIds
 */
function makeDm(props)
{
  Guard.againstNullBulk([props.participantIds]);

  if (!uniqueParticipants(props.participantIds))
  {
    return Result.fail('You can\'t make a DM with yourself.');
  }

  return Result.ok(new Channel({ ...props, type: 0 }));
}

/**
 * @param {Object} props 
 * @param {string} props.id
 * @param {ChannelTitle} props.title
 * @param {string} props.creatorId
 * @param {[string]} props.participantIds
 */
function makeGroupDm(props)
{
  Guard.againstNullBulk([props.participantIds, props.title, props.creatorId]);

  let creatorIsInParticipants = false;
  props.participantIds.forEach((participantId) => {
    if (participantId === props.creatorId)
    {
      creatorIsInParticipants = true;
    }
  });

  if (!creatorIsInParticipants)
  {
    throw new Error('ERR_CREATOR_NOT_IN_PARTICIPANTS');
  }

  if (!uniqueParticipants(props.participantIds))
  {
    return Result.fail('All members of a group must be unique.');
  }

  return Result.ok(new Channel({ ...props, type: 1 }));
}

/**
 * Creates a channel
 * @param {Object} props 
 * @param {string} props.id
 * @param {ChannelTitle} props.title
 * @param {Number} props.type
 * @param {string} props.creatorId
 * @param {[string]} props.participantIds
 */
function make(props)
{
  Guard.againstNull(props.type);
  let result = Result.fail('Unsupported Channel Type.');
  switch(props.type)
  {
    case 0:
      result = makeDm({ id: props.id, participantIds: props.participantIds });
      break;
    case 1:
      result = makeGroupDm({ id: props.id, participantIds: props.participantIds, creatorId: props.creatorId });
      break;
  }
  return result;
}

module.exports = {
  make,
};