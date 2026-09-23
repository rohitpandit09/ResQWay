export const NODE_POSITIONS = {
  "INT-01": [-18, 0, 14],
  "INT-02": [-18, 0, -14],
  "INT-03": [18, 0, -14],
  "INT-04": [18, 0, 14],
};

export const NODE_IDS = Object.keys(NODE_POSITIONS);
export const ROAD_WIDTH = 8;
export const LANE_LENGTH_FALLBACK = 280;

export function getNodePosition(nodeId) {
  return NODE_POSITIONS[nodeId] || null;
}

export function getEntityPosition(entity) {
  const start = getNodePosition(entity?.currentNode);
  const end = getNodePosition(entity?.nextNode);

  if (!start) {
    return null;
  }

  if (!end || entity?.position === null || entity?.position === undefined) {
    return [start[0], 1.1, start[2]];
  }

  const laneLength = Number(entity.laneLength) || LANE_LENGTH_FALLBACK;
  const progress = Math.max(0, Math.min(1, Number(entity.position) / laneLength));

  return [
    start[0] + (end[0] - start[0]) * progress,
    1.1,
    start[2] + (end[2] - start[2]) * progress,
  ];
}

export function getHeading(entity) {
  const start = getNodePosition(entity?.currentNode);
  const end = getNodePosition(entity?.nextNode);

  if (!start || !end) {
    return 0;
  }

  return Math.atan2(end[0] - start[0], end[2] - start[2]);
}
