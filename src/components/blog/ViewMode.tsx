import { type Component, onMount } from "solid-js";
import { viewMode } from "../../state/blogBrowserStateManager";
import SVGIcon from "../SVGIcon";
import style from "./ViewMode.module.scss";

const ViewMode: Component = () => {
  const [ getViewMode, setViewMode ] = viewMode;

  let gridInput!: HTMLInputElement;
  let listInput!: HTMLInputElement;
  let dashInput!: HTMLInputElement;

  const updateValue = (ev: InputEvent) => {
    if (ev.target instanceof HTMLInputElement == false) return;
    const value = ev.target.value;
    console.debug(`new radio value`, value);
    setViewMode(value as (`grid`|`list`|`dash`));

    window.localStorage.setItem(`blogLayout`, value);
  }

  onMount(() => {
    const vmSelect = window.localStorage.getItem(`blogLayout`);
    if (vmSelect != null) {
      if (vmSelect === `grid`) gridInput.checked = true;
      if (vmSelect === `list`) listInput.checked = true;
      if (vmSelect === `dash`) dashInput.checked = true;
    }
  });

  return (
    <div class={style.viewModes}>
			<label>
        <SVGIcon 
          src="/icons/layout-grid.svg"
          class={style.notSelected}
        />
        <SVGIcon 
          src="/icons/layout-grid-filled.svg"
          class={style.selected}
        />
				<input 
          ref={gridInput}
          oninput={updateValue}
          type="radio" 
          name="viewMode"
          value="grid" 
          autocomplete="off"
        />
			</label>
			<label>
				<SVGIcon 
          src="/icons/layout-list.svg"
          class={style.notSelected}
        />
        <SVGIcon 
          src="/icons/layout-list-filled.svg"
          class={style.selected}
        />
				<input 
          ref={listInput}
          oninput={updateValue}
          type="radio" 
          name="viewMode" 
          value="list"
          autocomplete="off"
          checked
        />
			</label>
			<label>
				<SVGIcon 
          src="/icons/layout-dashboard.svg"
          class={style.notSelected}
        />
        <SVGIcon 
          src="/icons/layout-dashboard-filled.svg"
          class={style.selected}
        />
				<input 
          ref={dashInput}
          oninput={updateValue}
          type="radio" 
          name="viewMode" 
          value="dash"
          autocomplete="off"
        />
			</label>
		</div>
  )
}

export default ViewMode;