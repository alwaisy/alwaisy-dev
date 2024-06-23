import { $cn } from "@/utils";
import { JavaScript, Typescript } from "../shared";
import { CodeSnippetsProps } from "./@types";
import SnippetSingle from "./_snippet";

export const snippets = [
  {
    title: "2D array to Array of Objects",
    bio: "Converts a 2D array of data to an array of objects, with each object containing the data from the corresponding row in the 2D array.",
    lang: [Typescript],
    link: "https://go.alwaisy.dev/2d-array-objects-tp",
  },
  {
    title: "Case insensitive search",
    bio: "Performs a case-insensitive search through an array of strings. Use different array methods",
    lang: [Typescript, JavaScript],
    link: "https://go.alwaisy.dev/combining-js-string-tp",
  },
  {
    title: "Check URL validity",
    bio: "There is a function that checks if a URL is valid or not. Old and new solutions to same problem",
    lang: [Typescript, JavaScript],
    link: "https://go.alwaisy.dev/check-url-validity-tp",
  },
];

const CodeSnippets: React.FC<CodeSnippetsProps> = ({ title, className }) => {
  const classes = $cn("section space-y-9", className);

  return (
    <section className={classes}>
      <h3 className="h3">{title}</h3>
      <div className="grid grid-cols-2 gap-9">
        {snippets.map((snippet) => (
          <SnippetSingle key={snippet.title} {...snippet} />
        ))}
      </div>
    </section>
  );
};

export default CodeSnippets;
