import { type Component, createSignal, For, Show } from "solid-js";
import { RandomStringinator } from "../../util/randomString";
import { type PostData } from "../../util/blogPostTools";
import { viewMode } from "../../state/blogBrowserStateManager";
import SearchForm from "../SearchForm";
import ViewMode from "./ViewMode";
import GridArticle from "./GridArticle";
import ListArticle from "./ListArticle";
import BlogPost from "./BlogPost";
import style from "./BaseBlogBrowser.module.scss";
import SVGIcon from "../SVGIcon";

// TODO: mobile support

// TODO: move search/filter algorithm to it's own file

// TODO: reduce grid columns on smaller displays

const BlogBrowser: Component<{ postData?: PostData[] }> = (props) => {
  const [ getViewMode, setViewMode ] = viewMode;
  const [ getPosts, setPosts ] = createSignal<PostData[]>([]);

  const vmSelect = window.localStorage.getItem(`blogLayout`);
  if (vmSelect != null) {
    setViewMode(vmSelect as (`grid`|`list`|`dash`));
  }

  const noResultStrings = [
    `no results found`,
    `behold, nothing`,
    `wow it's nothing`,
    `sadly, it's empty`,
    `i ate those posts, sorry`,
    `no posts to be found here`,
    `nothing but dust here`
  ];

  const stringinator = new RandomStringinator(noResultStrings);

  if (props.postData != null) {
    setPosts(props.postData);
  } else {
    console.debug(window.location.search);
    fetch(`/api/blog/posts${window.location.search}`).then(async (response) => {
      const posts: PostData[] = await response.json();

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
  }

  const urlParams = new URLSearchParams(window.location.search);
  const searchParams = urlParams.get(`search`);

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
          <a 
            href="blog/rss.xml" 
            title="subscribe via RSS"
            class={style.rss}
          >
            <SVGIcon src="/icons/rss.svg"/>
          </a>
          <SearchForm />
    			<ViewMode/>
        </div>
        <div 
          classList={{
            [style.active]: searchParams != null
          }}
          class={style.searchIndicator}
        >
          <h2>search results:</h2>
        </div>
  		</aside>

      <main 
        classList={{ 
          [`${style.gridView} contentBox`]: getViewMode() == `grid`,
          [style.listView]: getViewMode() == `list`,
          [style.dashView]: getViewMode() == `dash`
        }}
      >
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
        <div 
          class={style.listEndCap}
          classList={{
            "contentBox": getViewMode() !== `grid`
          }}
        >
          <Show when={getPosts().length > 0}>
            <h2 class={style.endOfPosts}>
              that's all, folks!
            </h2>
          </Show>
          <Show when={getPosts().length == 0}>
            <h2 class={style.noResults}>
              {stringinator.getCurrentString()}
            </h2>
          </Show>
        </div>
      </main>
  	</div>
  )
}

export default BlogBrowser;