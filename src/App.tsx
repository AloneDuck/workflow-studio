import { WorkflowStudio } from "@/components/WorkflowStudio";
import { sampleWorkflow } from "@/data/sample-workflow";

export default function App() {
  return <WorkflowStudio initialWorkflow={sampleWorkflow} />;
}
