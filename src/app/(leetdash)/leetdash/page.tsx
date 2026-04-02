import PeriodicTableCard from '@/components/leetdash/PeriodicTableCard';
import DashboardLayout from '@/components/leetdash/DashboardLayout';
import { MonitoringPanel } from '@/components/leetdash/MonitoringPanel';
import { AgentStatusPanel } from '@/components/leetdash/AgentStatusPanel';
import { CalendarPanel } from '@/components/leetdash/CalendarPanel';
import { TasksPanel } from '@/components/leetdash/TasksPanel';

export default function LeetDashPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8 text-foreground font-display">
        LeetDash Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TasksPanel />

        <CalendarPanel />

        <AgentStatusPanel />

        <PeriodicTableCard symbol="Ch" name="Chat" metric="5">
          <p>New messages and conversations.</p>
        </PeriodicTableCard>

        <MonitoringPanel />
      </div>
    </DashboardLayout>
  );
}

