import { createSignal, onMount, type Component, type JSX } from "solid-js";
import style from './CopyTextModal.module.scss'
import SVGIcon from "./SVGIcon";

const focusable = [
  `audio`, 
  `video`, 
  `button`, 
  `canvas`, 
  `details`, 
  `summary`, 
  `iframe`, 
  `input`, 
  `select`, 
  `textarea`, 
  `[contenteditable]`, 
  `a[href]`
];

type TabIndexState = {
  element: Element,
  tabindex: string
}

const CopyTextModal: Component<{children: JSX.Element, text: string, title: string, class?: string}> = (props) => {
  const [getOpened, setOpened] = createSignal<boolean>(false);

  let tabindexStates: TabIndexState[] = [];

  let button!: HTMLAnchorElement
  let modal!: HTMLDivElement
  let closeButton!: HTMLButtonElement
  let textField!: HTMLInputElement
  let copyButton!: HTMLButtonElement

  const openModal = (ev: MouseEvent) => {
    const elements = document.querySelectorAll(focusable.join(`, `));
    for (const element of elements) {
      if (modal.contains(element)) {
        element.removeAttribute(`tabindex`);
      } else {
        const tabindex = element.getAttribute(`tabindex`);

        if (tabindex != null) {
          tabindexStates.push({
            element,
            tabindex
          });
        } else {
          element.setAttribute(`tabindex`, `-1`);
        }
      }
    }

    setOpened(true);
    closeButton.focus()
  }

  const closeModal = (ev: MouseEvent, exact: boolean = false) => {
    if (exact && ev.target != ev.currentTarget) return;
    const elements = document.querySelectorAll(focusable.join(`, `));
    restoreState: for (const element of elements) {
      if (modal.contains(element)) {
        element.setAttribute(`tabindex`, `-1`);
      } else {
        for (const prevState of tabindexStates) {
          if (prevState.element == element) {
            element.setAttribute(`tabindex`, prevState.tabindex);
            continue restoreState;
          }
        }

        element.removeAttribute(`tabindex`);
      }
    }

    setOpened(false);
    button.focus();
  }

  const onTextFocus = (ev: FocusEvent) => {
    textField.select();
  }

  const copyText = async () => {
    navigator.clipboard.writeText(props.text).then(() => {
      // trigger copied animation
      copyButton.classList.remove(style.copyAnimator);
      void copyButton.offsetWidth;
      copyButton.classList.add(style.copyAnimator);
    }).catch((err: DOMException) => {
      alert(`Could not write data to clipboard: (${err.name}) ${err.message}`);
    });
  }

  onMount(() => {
    textField.value = props.text;

    const elements = modal.querySelectorAll(focusable.join(`, `));
    for (const element of elements) {
      element.setAttribute(`tabindex`, `-1`);
    }
  });

  return (
    <>
      <a
        ref={button} 
        href="javascript:void(0);"
        class={props.class} 
        onclick={openModal}
      >
        {props.children}
      </a>
      <div 
        ref={modal}
        onclick={(ev) => closeModal(ev, true)}
        classList={{ [style.open]: getOpened() }}
        class={style.modalBase}
      >
        <div class={`contentBox ${style.modal}`}>
          <div class={style.header}>
            <h1>{props.title}</h1>
            <button 
              ref={closeButton} 
              class={style.closeButton} 
              onclick={closeModal}
            >
              <SVGIcon src="/icons/x.svg" />
            </button>
          </div>
          <input 
            ref={textField} 
            class={style.textField}
            type="text" 
            readonly
            onfocus={onTextFocus}
          />
          <button 
            ref={copyButton}
            class={style.copyButton}
            onclick={copyText}
          >
            <span class={style.normLabel}>copy to clipboard</span>
            <span class={style.copyLabel}>
              <SVGIcon src="/icons/check.svg" />
              copied!
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default CopyTextModal;