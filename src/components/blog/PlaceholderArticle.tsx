import { type Component } from "solid-js";
import style from "./PlaceholderArticle.module.scss";

const PlaceholderArticle: Component = (props) => {
  return (
    <div class={style.placeholder}>
    </div>
  )
}

export default PlaceholderArticle;