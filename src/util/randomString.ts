import { createSignal } from "solid-js";

export class RandomStringinator {
  allOpts;
  weights;
  currentIndex = 0;
  getCurrentString;
  setCurrentString;

  constructor(opts: string[]) {
    this.allOpts = opts;

    const baseWeights: number[] = [];
    for (let i = 0; i < opts.length; i++) {
      baseWeights.push(1);
    }

    this.weights = baseWeights;

    [ this.getCurrentString, this.setCurrentString ] = createSignal<string>(``);
    this.refresh();

    // setInterval(() => {
    //   this.refresh();
    // }, 100);
  }

  refresh() {
    let lowestWeight = this.weights[0];
    let highestWeight = 0
    for (const weight of this.weights) {
      if (weight > highestWeight) {
        highestWeight = weight;
      }

      if (lowestWeight > weight) {
        lowestWeight = weight;
      }
    }

    let weightSum = 0;
    for (const weight of this.weights) {
      weightSum += 1 / (weight / highestWeight);
    }

    let randomNumber = Math.random() * weightSum;

    for (let randomIndex = 0; randomIndex < this.allOpts.length; randomIndex++) {
      const inverseWeight = 1 / (this.weights[randomIndex] / highestWeight);
      if (randomNumber < inverseWeight) {
        // ensure we don't pick the same string again
        if (randomIndex === this.currentIndex) {
          console.debug(`flipping coin to resolve same result error`);
          // flip a coin
          if (Math.random() >= 0.5) {
            randomIndex += 1;
            if (randomIndex === this.allOpts.length) {
              // wrap to start
              randomIndex = 0;
            }
          } else {
            randomIndex -= 1;
            if (randomIndex < 0) {
              // wrap to end
              randomIndex = (this.allOpts.length - 1);
            }
          }
        }

        const output = this.allOpts[randomIndex];

        this.currentIndex = randomIndex;
        this.weights[randomIndex] += 100;
        this.setCurrentString(output);
        return output;
      } else {
        randomNumber -= inverseWeight;
      }
    }
  }
}