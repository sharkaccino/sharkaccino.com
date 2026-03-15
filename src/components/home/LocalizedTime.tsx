import { createSignal, onMount, type Component, type JSX } from "solid-js";
import SVGIcon from "../SVGIcon";
import style from './LocalizedTime.module.scss'

const hourMsg = [
  {
    hour: 8,
    text: `i might be awake, but i'm usually only up this early because of errands i have to run. i should get back to you soon, though!`
  },
  {
    hour: 10,
    text: `i'm usually awake around this time. i could be doing some things, but feel free to say hi!`
  },
  {
    hour: 20,
    text: `if i was working today, i should be home by now. it's getting a bit late here, but feel free to get in touch anyway!`
  },
  {
    hour: 22,
    text: `i might be pretty tired at this point, but i could still respond. feel free to try your luck!`
  },
  {
    hour: 23,
    text: `i'm probably asleep. feel free to send me a message, but it might take me a while to get back to you!`
  },
]

const LocalizedTime: Component = (props) => {
  const [getReadableTime, setReadableTime] = createSignal<string>(`[...]`);
  const [getTimeMessage, setTimeMessage] = createSignal<string>(`[...]`);

  const updateMyTime = () => {
    const currentHour = parseInt(new Date().toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: `America/Los_Angeles`
    }));

    // testing only
    // const currentHour = 1;

    setReadableTime(new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: `America/Los_Angeles`
    }));

    let pickMsg = ``;

    for (const message of hourMsg) {
      if (message.hour > currentHour) break;
      pickMsg = message.text;
    }

    if (pickMsg.length === 0) {
      pickMsg = hourMsg[hourMsg.length - 1].text;
    }

    setTimeMessage(pickMsg);
  }

  onMount(() => {
    updateMyTime();
    setInterval(updateMyTime, 10000);
  });

  return (
    <div>
      <span class={style.time}><SVGIcon src="/icons/clock.svg" /> it's about <b>{getReadableTime()}</b> my time.</span>
      <p class={style.message}>{getTimeMessage()}</p>
    </div>
  )
}

export default LocalizedTime;