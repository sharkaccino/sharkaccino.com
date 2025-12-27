import { type Component, createEffect } from "solid-js";
import SVGIcon from "./SVGIcon";
import style from "./Pagination.module.scss";

type PaginationOptions = {
  prevUrl?: string; 
  nextUrl?: string; 
  index: number; 
  pages: number;
}

const Pagination: Component<PaginationOptions> = (props) => {
	let prevButton!: HTMLAnchorElement;
	let nextButton!: HTMLAnchorElement;

	createEffect(() => {
		if (props.prevUrl != null && props.prevUrl.length > 0) {
			prevButton.classList.add(style.enabled);
		} else {
			prevButton.tabIndex = -1
		}

		if (props.nextUrl != null && props.nextUrl.length > 0) {
			nextButton.classList.add(style.enabled);
		} else {
			nextButton.tabIndex = -1
		}
	});

  return (
    <nav class={`${style.pagination} contentBox`}>
			<a 
				ref={prevButton}
				class={style.prevButton}
				href={props.prevUrl} 
				aria-label="Previous Page"
			>
				<SVGIcon src="/icons/chevron-left.svg" />
			</a>
			
			<span class={style.index}>
        {props.index} / {props.pages}
      </span>

			<a 
				ref={nextButton}
				class={style.nextButton}
				href={props.nextUrl} 
				aria-label="Next Page"
			>
				<SVGIcon src="/icons/chevron-right.svg" />
			</a>
		</nav>
  )
}

export default Pagination;