import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Parallax } from "~/components/router-head/parallax";

export default component$(() => {
  return (
    <>  
      <Parallax />
    </>
  );
});

export const head: DocumentHead = {
  title: "Roy's Travel Memories",
  meta: [
    {
      name: "description",
      content: "Roy & Buccula's Turkiye Travel Memories",
    },
  ],
};
