import { onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sendSocket, state as messagesState } from './messages'

const state = reactive({
  interval: null as Nullable<NodeJS.Timeout>,
  timeHolding: 0,
  longPressFired: false,
  initialX: null as Nullable<number>,
  initialY: null as Nullable<number>,
  reactingMessage: null as Nullable<JQuery<HTMLElement>>,
  reactingMessageGUID: null as Nullable<string>,
  reactingMessageReactions: null as Nullable<object>,
  reactingMessagePart: 0,
  reactingToBalloon: false,
})

const openReactionMenu = (msgId: string, textId: string, guid: string, reactions: object, part: number, balloon: boolean) => {
  const el = $('#msg' + msgId + '-text' + textId + '-part' + part)
  state.reactingMessageReactions = reactions
  state.reactingMessageGUID = guid
  state.reactingMessagePart = part
  state.reactingMessage = el
  state.reactingToBalloon = balloon
  if (navigator.vibrate) navigator.vibrate(8)
}

const startInterval = (msgId: string, textId: string, guid: string, reactions: object, part: number, balloon: boolean) => {
  if (!state.interval) {
    state.longPressFired = false
    state.interval = setInterval(() => {
      state.timeHolding++
      if (state.timeHolding > 4) {
        openReactionMenu(msgId, textId, guid, reactions, part, balloon)
        state.longPressFired = true
        if (state.interval) clearInterval(state.interval)
        state.interval = null
        state.timeHolding = 0
      }
    }, 100)
  }
}

const stopInterval = () => {
  if (state.interval) clearInterval(state.interval)
  state.interval = null
  state.timeHolding = 0
  state.initialX = null
  state.initialY = null
}

const stopIntervalTouch = (e: TouchEvent) => {
  if (state.longPressFired) {
    state.longPressFired = false
    if (e.cancelable) e.preventDefault()
  }
  stopInterval()
}

const stopIntervalWhen = (e: MouseEvent | TouchEvent) => {
  if (state.interval) {
    const point = 'touches' in e ? e.touches[0] : e
    if (!point) return

    if (!state.initialX) state.initialX = point.clientX
    if (!state.initialY) state.initialY = point.clientY

    const tolerance = 'touches' in e ? 10 : 4
    if (Math.abs(state.initialX - point.clientX) > tolerance || Math.abs(state.initialY - point.clientY) > tolerance) {
      stopInterval()
    }
  }
}

const closeReactionMenu = () => {
  state.reactingMessage = null
  state.reactingMessageGUID = null
  state.reactingMessageReactions = null
  state.reactingMessagePart = 0
}

const sendReaction = (reactionId: string, guid: string, part: string) => {
  if (!messagesState.messages[0]) return
  sendSocket({
    action: 'sendReaction',
    data: {
      chatId: messagesState.messages[0].chatId,
      guid: guid,
      reactionId: reactionId,
      part: part,
    },
  })
}

export default () => {
  const route = useRoute()

  const init = () => {
    state.reactingMessage = null
    state.reactingMessageGUID = null
    state.reactingMessageReactions = null
    state.reactingMessagePart = 0
    state.interval = null
    state.timeHolding = 0
    state.initialX = null
    state.initialY = null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // ipcRenderer.on('reactToMessage', (_e: any, args: any) => {
      //       openReactionMenu(args.id, args.ii, args.guid, args.reactions, args.part, args.balloon)
    //     })
  }

  onMounted(init)
  watch(() => route?.params.id, init)

  return {
    openReactionMenu,
    startInterval,
    stopInterval,
    stopIntervalTouch,
    stopIntervalWhen,
    closeReactionMenu,
    sendReaction,
    state,
  }
}
