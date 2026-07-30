import type { Metadata } from "next";
import catalog from "../../examples/anthropics-2026.json";
import OrganizationOverview from "../organization-overview";

export const metadata:Metadata = {
  title:"Anthropic Repository World — Projects Overview",
  description:"An interactive map of Anthropic's public GitHub repositories touched in 2026.",
};

export default function AnthropicPage() {
  return <OrganizationOverview catalog={catalog} displayName="Anthropic" peer={{label:"OpenAI world",href:"/openai"}}/>;
}
