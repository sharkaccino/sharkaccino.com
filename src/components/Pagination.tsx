import { type Component, Show } from "solid-js";
import SVGIcon from "./SVGIcon";
import style from "./Pagination.module.scss";

type PaginationOptions = {
  prevUrl?: string; 
  nextUrl?: string; 
  index: number; 
  pages: number;
}

const Pagination: Component<PaginationOptions> = (props) => {
  return (
    <nav class={`${style.pagination} small`}>
			<Show when={props.prevUrl != null}>
				<a 
					class={`${style.prevButton} contentBox`} 
					href={props.prevUrl} 
					aria-label="Previous Post"
				>
					<SVGIcon src="/icons/chevron-left.svg" />
				</a>
			</Show>
			
			<span class={`${style.index} contentBox`}>
        {props.index} / {props.pages}
      </span>

			<Show when={props.nextUrl != null}>
				<a 
					class={`${style.nextButton} contentBox`}
					href={props.nextUrl} 
					aria-label="Next Post"
				>
					<SVGIcon src="/icons/chevron-right.svg" />
				</a>
			</Show>
		</nav>
  )
}

export default Pagination;