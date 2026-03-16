import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { RandomStringinator } from "../../util/randomString";
import { type BlogAPIResults, type PostData } from "../../util/blogPostTools";
import { viewMode } from "../../state/blogBrowserStateManager";
import SearchForm from "../SearchForm";
import ViewMode from "./ViewMode";
import GridArticle from "./GridArticle";
import ListArticle from "./ListArticle";
import BlogPost from "./BlogPost";
import style from "./BaseBlogBrowser.module.scss";
import Pagination from "../Pagination";
import PlaceholderArticle from "./PlaceholderArticle";

// TODO: mobile support

const noResultStrings = [
  `no results found`,
  `behold, nothing`,
  `wow it's nothing`,
  `sadly, it's empty`,
  `i ate those posts, sorry`,
  `no posts to be found here`,
  `nothing but dust here`
];

const BlogBrowser: Component<{ postData?: PostData[] }> = (props) => {
  const [ getViewMode, setViewMode ] = viewMode;
  const [ getPosts, setPosts ] = createSignal<PostData[]|null>(null);
  const [ getCurrentPage, setCurrentPage ] = createSignal<number>(1);
  const [ getPageCount, setPageCount ] = createSignal<number>(1);
  const [ getNextPage, setNextPage ] = createSignal<string>(``);
  const [ getPrevPage, setPrevPage ] = createSignal<string>(``);

  let urlParams = new URLSearchParams(``);

  const stringinator = new RandomStringinator(noResultStrings);

  const vmSelect = window.localStorage.getItem(`blogLayout`);
  if (vmSelect != null) {
    setViewMode(vmSelect as (`grid`|`list`|`dash`));
  }

  onMount(() => {
    urlParams = new URLSearchParams(window.location.search);

    console.debug(window.location.search);
    fetch(`/api/blog/posts${window.location.search}`).then(async (response) => {
      const json: BlogAPIResults = await response.json();
      const posts: PostData[] = json.posts;

      setCurrentPage(json.pageNumber+1);
      setPageCount(json.totalPages);

      const cleanLocation = window.location.href.split(/[?#]/)[0];

      if (json.pageNumber > 0) {
        const newParams = new URLSearchParams(window.location.search);

        if (json.pageNumber === 1) {
          // page number is zero-indexed in api
          // which means this is actually page 2
          // which then means the previous page would be page 1
          // which *then* means we dont need a previous page button
          newParams.delete(`page`);
        } else {
          newParams.set(`page`, (json.pageNumber).toString());
        }

        const p = newParams.toString();

        if (p.length > 0) {
          setPrevPage(cleanLocation + `?${p}`);
        } else {
          setPrevPage(cleanLocation);
        }
      }

      if (json.totalPages > 1 && json.pageNumber+1 != json.totalPages) {
        const newParams = new URLSearchParams(window.location.search);
        newParams.set(`page`, (json.pageNumber+2).toString());

        setNextPage(cleanLocation + `?${newParams.toString()}`);
      }

      // quick data validation
      // dates are not entirely serializable,
      // they only come in as numbers or strings
      for (const i in posts) {
        posts[i].data.pubDate = new Date(posts[i].data.pubDate);

        if (posts[i].data.editDate != null) {
          posts[i].data.editDate = new Date(posts[i].data.editDate);
        }
      }

      setPosts(posts);
      console.debug(posts);
    });
  });

  return (
    <div
      class={style.browser}
      classList={{ 
        "large": getViewMode() === `grid`,
        "medium": getViewMode() === `list`,
        "small": getViewMode() === `dash`
      }} 
    >
  		<aside class="contentBox">
  			<div class={style.hbox}>
          <SearchForm />
    			<ViewMode/>
        </div>
        <div 
          class={style.searchIndicator}
          classList={{
            [style.active]: urlParams.get(`search`) != null
          }}
        >
          <h2>search results:</h2>
        </div>
  		</aside>

      <main 
        classList={{ 
          "contentBox": getViewMode() === `grid`,
          [style.gridView]: getViewMode() === `grid`,
          [style.listView]: getViewMode() === `list`,
          [style.dashView]: getViewMode() === `dash`
        }}
      >
        <Show when={getPosts() == null}>
          <PlaceholderArticle />
          <PlaceholderArticle />
          <PlaceholderArticle />
          <PlaceholderArticle />
        </Show>
        <Show when={getPosts() != null}>
          <For each={getPosts()}>
            {(post) => {
              return (
                <>
                  <Show when={getViewMode() == `grid`}>
                    <GridArticle postData={post}/>
                  </Show>
                  <Show when={getViewMode() == `list`}>
                    <ListArticle postData={post}/>
                  </Show>
                  <Show when={getViewMode() == `dash`}>
                    <BlogPost postData={post}/>
                  </Show>
                </>
              )
            }}
          </For>
          <Show when={getPosts()!.length == 0}>
            <div 
              class={style.listEndCap}
              classList={{
                "contentBox": getViewMode() !== `grid`
              }}
            >
              <h2 class={style.noResults}>
                {stringinator.getCurrentString()}
              </h2>
            </div>
          </Show>
        </Show>
      </main>

      <Pagination 
        prevUrl={getPrevPage()} 
        nextUrl={getNextPage()} 
        index={getCurrentPage()}
        pages={getPageCount()}
      />
  	</div>
  )
}

export default BlogBrowser;