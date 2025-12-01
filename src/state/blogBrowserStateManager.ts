import { createSignal } from "solid-js";

export const viewMode = createSignal<`grid`|`list`|`dash`>(`list`);