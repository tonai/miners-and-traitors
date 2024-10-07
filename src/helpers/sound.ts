import CGM3_Funny_Negative_Feedback_01_3 from "../assets/sound/CGM3_Funny_Negative_Feedback_01_3.ogg"
import Chest_Magic_Opening_01 from "../assets/sound/Chest_Magic_Opening_01.ogg"
import Explosion from "../assets/sound/Explosion 2.ogg"
import Gravel from "../assets/sound/Gravel 38.ogg"
import LQ_Positive_Notification from "../assets/sound/LQ_Positive_Notification.ogg"
import PP_Negative_Feedback from "../assets/sound/PP_Negative_Feedback.ogg"
import PP_Negative_Trigger_1_1 from "../assets/sound/PP_Negative_Trigger_1_1.ogg"
import Success from "../assets/sound/Success 4c.ogg"

export function getSound(name: string): HTMLAudioElement | undefined {
  switch (name) {
    case "discard":
      return new Audio(CGM3_Funny_Negative_Feedback_01_3)
    case "addTile":
      return new Audio(Gravel)
    case "tileGoal":
      return new Audio(Chest_Magic_Opening_01)
    case "tileLure":
      return new Audio(PP_Negative_Feedback)
    case "brokenPickaxe":
      return new Audio(PP_Negative_Trigger_1_1)
    case "pickaxe":
      return new Audio(LQ_Positive_Notification)
    case "removeTile":
      return new Audio(Explosion)
    case "addon":
      return new Audio(Success)
  }
}

export async function playSound(name: string, volume = 50): Promise<void> {
  const sound = getSound(name)
  if (sound) {
    sound.volume = volume / 100
    return sound.play()
  }
}
