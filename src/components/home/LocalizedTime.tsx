import { createSignal, onMount, type Component, type JSX } from "solid-js";
import SVGIcon from "../SVGIcon";
import style from './LocalizedTime.module.scss'

const hourMsg = [
  {
    hour: 2,
    text: `i'm probably asleep. it'll take me a while to get back to you!`
  },
  {
    hour: 8,
    text: `i might be awake, but i usually like to sleep in. i'll get back to you soon, though!`
  },
  {
    hour: 10,
    text: `i'm probably awake by now. try getting in touch!`
  },
  {
    hour: 12,
    text: `i'm usually awake around this time. feel free to message me!`
  },
  {
    hour: 20,
    text: `if i was working today, i should be home by now. feel free to get in touch!`
  },
  {
    hour: 22,
    text: `it's getting a bit late here, but i might still respond!`
  }
]

const LocalizedTime: Component = (props) => {
  const [getReadableTime, setReadableTime] = createSignal<string>(`0:00 PM`);
  const [getTimeMessage, setTimeMessage] = createSignal<string>(`[...]`);

  const updateMyTime = () => {
    const currentHour = parseInt(new Date().toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: `America/Los_Angeles`
    }));

    setReadableTime(new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: `America/Los_Angeles`
    }));

    let pickMsg = hourMsg[0].text;

    for (const message of hourMsg) {
      if (message.hour > currentHour) break;
      pickMsg = message.text;
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