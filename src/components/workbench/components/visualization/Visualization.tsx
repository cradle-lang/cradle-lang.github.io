import EventFlowView from './EventFlowView';
import TopologyView from './TopologyView';

import type {
  ParsedCradle,
  Point,
  Selection,
  WorkbenchView,
} from '../../types/workbench';

type Props = {
  parsed: ParsedCradle;

  view: WorkbenchView;

  showLabels: boolean;
  showObjects: boolean;

  nodePositions: Record<string, Point>;
  networkPositions: Record<string, Point>;

  onNodeMove: (
    id: string,
    position: Point,
  ) => void;

  onNetworkMove: (
    id: string,
    position: Point,
  ) => void;

  onSelect: (
    selection: Selection,
  ) => void;
};

export default function Visualization({
  parsed,
  view,
  showLabels,
  showObjects,
  nodePositions,
  networkPositions,
  onNodeMove,
  onNetworkMove,
  onSelect,
}: Props) {
  if (view === 'events') {
    return (
      <EventFlowView
        parsed={parsed}
        onSelect={onSelect}
      />
    );
  }

  return (
    <TopologyView
      parsed={parsed}
      showLabels={showLabels}
      showObjects={showObjects}
      nodePositions={nodePositions}
      networkPositions={
        networkPositions
      }
      onNodeMove={onNodeMove}
      onNetworkMove={
        onNetworkMove
      }
      onSelect={onSelect}
    />
  );
}