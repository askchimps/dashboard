import AgentGrid from "@/components/grid/agent";
import SectionHeader from "@/components/section-header/section-header";

export default async function AgentTabContent() {
    return (
        <>
            <SectionHeader label="Agents" />
            <AgentGrid />
        </>
    );
}