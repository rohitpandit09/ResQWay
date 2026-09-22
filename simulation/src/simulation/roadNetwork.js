const ROWS = ["A", "B", "C", "D"];

// Uneven X positions
export const ROAD_X_POSITIONS = [
  -46,
  -10,
  17,
  52,
];

// Uneven Z positions
export const ROAD_Z_POSITIONS = [
  44,
  15,
  -22,
  -52,
];

export const ROAD_NODES = {};

ROWS.forEach((row, rowIndex) => {
  for (let col = 1; col <= 4; col++) {
    const id = `${row}${col}`;

    ROAD_NODES[id] = {
      id,
      row,
      column: col,

      position: [
        ROAD_X_POSITIONS[col - 1],
        0,
        ROAD_Z_POSITIONS[rowIndex],
      ],

      type: "INTERSECTION",

      signal: {
        id: `ATCS-${id}`,

        controller: "ICCC_ATCS",

        state: "RED",

        phase: 0,

        cycleSeconds: 42,
      },
    };
  }
});

export const ROAD_CONNECTIONS = [];

for (const row of ROWS) {
  for (let col = 1; col < 4; col++) {
    ROAD_CONNECTIONS.push({
      id: `${row}${col}-${row}${col + 1}`,

      from: `${row}${col}`,

      to: `${row}${col + 1}`,
    });
  }
}

for (
  let rowIndex = 0;
  rowIndex < ROWS.length - 1;
  rowIndex++
) {
  const currentRow =
    ROWS[rowIndex];

  const nextRow =
    ROWS[rowIndex + 1];

  for (
    let col = 1;
    col <= 4;
    col++
  ) {
    ROAD_CONNECTIONS.push({
      id: `${currentRow}${col}-${nextRow}${col}`,

      from: `${currentRow}${col}`,

      to: `${nextRow}${col}`,
    });
  }
}

function calculateDistance(
  fromNode,
  toNode
) {
  const dx =
    toNode.position[0] -
    fromNode.position[0];

  const dz =
    toNode.position[2] -
    fromNode.position[2];

  return Math.sqrt(
    dx * dx +
      dz * dz
  );
}

export const ROAD_EDGES =
  ROAD_CONNECTIONS.flatMap(
    (connection) => {
      const from =
        ROAD_NODES[
          connection.from
        ];

      const to =
        ROAD_NODES[
          connection.to
        ];

      const length =
        calculateDistance(
          from,
          to
        );

      return [
        {
          id: `${connection.from}${connection.to}`,

          from: connection.from,

          to: connection.to,

          length,
        },

        {
          id: `${connection.to}${connection.from}`,

          from: connection.to,

          to: connection.from,

          length,
        },
      ];
    }
  );

export const EMERGENCY_ROUTES = {
  toClient: [
    "A1",
    "A2",
    "B2",
    "C2",
  ],

  toHospital: [
    "C2",
    "C3",
    "D3",
    "D4",
    "C4",
    "B4",
    "A4",
  ],
};

export const FULL_EMERGENCY_ROUTE = [
  ...EMERGENCY_ROUTES.toClient,

  ...EMERGENCY_ROUTES.toHospital.slice(
    1
  ),
];

export const CLIENT_NODE = "C2";

export const HOSPITAL_NODE = "A4";

export const AMBULANCE_START_NODE =
  "A1";

export function getNode(nodeId) {
  return (
    ROAD_NODES[nodeId] ||
    null
  );
}

export function getRoutePoints(
  route
) {
  return route
    .map((nodeId) =>
      ROAD_NODES[nodeId]
    )
    .filter(Boolean)
    .map(
      (node) =>
        node.position
    );
}