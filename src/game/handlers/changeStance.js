import {
  partial,
  nth,
} from 'ramda'

import { ObjectId } from 'mongodb'
import models from '../models'
import { reject, rejectUndefined } from './errors'

function changeStance (dao, playerId, stance, char) {
  return dao.character.update(
    { _id: char.id },
    { $set: { stance } },
  )
}

function checkStance (_, msg, char, stanceId) {
  const currentClass = models.classes.find(char.classId)

  if (!currentClass.stances.find(sId => sId === stanceId)) {
    return reject(msg, _('Invalid stance'))
  }
  return char
}

export default function call (dao, provider, _, msg) {
  const stanceId = msg.matches[1]
  const stance = models.stances.find(stanceId)
  const charId = msg.player.currentCharId

  return dao.character
    .find({
      _id: ObjectId(charId),
    })
    .then(nth(0))
    .then(rejectUndefined(msg, _('Invalid char Id')))
    .then(char => checkStance(_, msg, char, stanceId))
    .then(partial(changeStance, [dao, msg.player.id, stanceId]))
    .then(() => ({
      to: msg.chat,
      text: _('You are now using <b>%s</b> %s', stance.name, stance.emoji),
    }))
}

