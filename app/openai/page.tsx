import type { Metadata } from "next";
import catalog from "../../examples/openai-2026.json";
import OrganizationOverview from "../organization-overview";

export const metadata:Metadata = {
  title:"OpenAI Repository World — Projects Overview",
  description:"An interactive map of OpenAI's public GitHub repositories touched in 2026.",
};

export default function OpenAIPage() {
  return <OrganizationOverview catalog={catalog} displayName="OpenAI" peer={{label:"Anthropic world",href:"/anthropics"}}/>;
}
