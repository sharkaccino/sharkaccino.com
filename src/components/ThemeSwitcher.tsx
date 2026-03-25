import { Show, type Component } from "solid-js";

const ThemeSwitcher: Component = () => {
  let checkbox!: HTMLInputElement
  let checked = false;

  console.debug(document.cookie);

  const cookieSearch = document.cookie.match(/(?<=theme=)[^;]+/);
  console.debug(cookieSearch);

  if (cookieSearch != null) {
    if (cookieSearch[0] == `dark`) {
      checked = true;
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    checked = true;
  }

  const handleSwitch = () => {
    console.debug(checkbox.checked);

    if (checkbox.checked) {
      document.cookie = `theme=dark;`;
      document.documentElement.className = `dark`;
    } else {
      document.cookie = `theme=light;`;
      document.documentElement.className = `light`;
    }
  }

  return (
    <>
      <Show when={checked == true}>
        <input 
          ref={checkbox} 
          type="checkbox" 
          autocomplete="off" 
          onInput={handleSwitch}
          checked 
        />
      </Show>
      <Show when={checked == false}>
        <input 
          ref={checkbox} 
          type="checkbox" 
          autocomplete="off"
          onInput={handleSwitch} 
        />
      </Show>
    </>
  )
}

export default ThemeSwitcher;