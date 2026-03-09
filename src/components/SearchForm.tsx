import { type Component, onMount } from "solid-js";
import SVGIcon from "./SVGIcon";
import style from "./SearchForm.module.scss";

// TODO: show suggestions when inputting keywords

// TODO: replace input with contentEditable element to allow for text highlighting
// this can be used to highlight invalid keywords

// references:
// https://stackoverflow.com/a/55950530
// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable

const SearchForm: Component = () => {
  let formElem!: HTMLFormElement;
  let textElem!: HTMLInputElement;
  let sortElem!: HTMLSelectElement;
  let submitButton!: HTMLInputElement;

  let initialTextValue = ``;

  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(`search`) ;
  const sortParam = urlParams.get(`sort`);
  if (searchParam != null) initialTextValue = searchParam;

  const handleTextInput = (ev: InputEvent) => {
    if (ev.target instanceof HTMLInputElement == false) return;

    // tag helper
    // automatically converts hashtags to the proper keyword format
    // only applies when there is no other text in the field
    if (ev.data != null) {
      if (ev.data.startsWith(`#`)) {
        if (ev.data.length === ev.target.value.length) {
          // this is the only thing in the entire input
          if (ev.data.length === 1) {
            // just the hash character by itself
            const newVal = `tag:""`;
            ev.target.value = newVal
            ev.target.selectionStart = newVal.length-1;
            ev.target.selectionEnd = newVal.length-1;
          } else {
            // pasted hashtags
            ev.target.value = `tag:"${ev.data.substring(1)}"`
          }
        }
      }
    }

    if (searchParam != null) {
      submitButton.disabled = ev.target.value.trim() === searchParam;
    } else {
      submitButton.disabled = ev.target.value.trim().length === 0
    }
  }

  const handleSortChange = (ev: Event) => {
    if (ev.target instanceof HTMLSelectElement == false) return;

    if (sortParam != null) {
      submitButton.disabled = ev.target.value === sortParam;
    } else {
      submitButton.disabled = ev.target.value === `relevance`;
    }
  }

  const handleSubmit = (ev: SubmitEvent) => {
    ev.preventDefault();

    if (textElem.value.trim().length === 0) {
      textElem.removeAttribute(`name`);
    }

    if (sortElem.value === `relevance`) {
      sortElem.removeAttribute(`name`);
    }

    const data = [...new FormData(formElem)];
    // console.debug(data);

    if (data.length > 0) {
      formElem.submit();
    } else {
      window.location.search = ``;
    }
  }

  onMount(() => {
    if (sortParam != null) {
      for (const child of sortElem.children) {
        if (child instanceof HTMLOptionElement == false) continue;
        if (child.value === sortParam) {
          child.selected = true;
          break;
        }
      }
    }
  });

  return (
    <form 
      ref={formElem} 
      onsubmit={handleSubmit}
      class={style.form}
    >
      <label class={style.searchBar}>
  			<input 
          name="search"
          ref={textElem}
          oninput={handleTextInput} 
          type="search" 
          placeholder="search" 
          autocomplete="off"
          value={initialTextValue}
        />
  			<SVGIcon src="/icons/search.svg" class={style.searchIcon}/>
  		</label>
      <label class={style.sortMode}>
  			<span>sort by:</span>
  			<select 
          name="sort"
          ref={sortElem}
          onchange={handleSortChange}
          autocomplete="off"
        >
  				<option value="relevance">relevance</option>
  				<option value="newestFirst">newest first</option>
  				<option value="oldestFirst">oldest first</option>
          <option value="recentlyUpdated">recently updated</option>
          <option value="mostLiked">most liked</option>
          <option value="random">random</option>
  			</select>
        <SVGIcon src="/icons/chevron-down.svg" class={style.arrow}/>
  		</label>
      <label class={style.submit}>
        <input ref={submitButton} type="submit" disabled />
        <SVGIcon src="/icons/arrow-right.svg"/>
      </label>
    </form>
  )
}

export default SearchForm;