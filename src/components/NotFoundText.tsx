import { type Component } from "solid-js";
import { RandomStringinator } from "../util/randomString";

const NotFoundText: Component = () => {
  const stringOpts = [
    `it ain't here`,
    `idk what ur looking for`,
    `i'll make it later, maybe`,
    `sorry i ate it :(`,
    `did you try turning ur browser off and on again`,
    `aw dangit`,
    `dammit`,
    `oops`,
    `whoops`,
    `shoot`,
    `aaaand there's nothing here`,
    `that's totally bogus, bro`,
    `bummer`,
    `in ancient times, this would've been referred to as a 'bruh moment'`,
    `sure hope nothing was actually supposed to be here, otherwise i messed something up REAL bad`,
    `what if it was all just a dream`,
    `trolled lol`,
    `crap!!!!!!!`,
    `sudo rm -rf /thispage.html`,
    `there's an alternate universe where this page exists, just shift reality a few times i'm sure you'll find it eventually`,
    `fun fact: there are 21 possible strings randomly chosen for this span of text, including this one!`
  ];

  for (const i in stringOpts) {
    stringOpts[i] = `"${stringOpts[i]}"`; 
  }

  const stringinator = new RandomStringinator(stringOpts);

  return (
    <span>{stringinator.getCurrentString()}</span>
  )
}

export default NotFoundText;