import fs from "fs";
import os from "os";
import { ProjectIntent, ProjectResponse, ResourceIntent } from "./types";

export { ProjectResponse } from "./types";
export { default as getProjectData } from "./client";

function mapIntentToResource(intent: ProjectIntent): Partial<ResourceIntent> {
  const RETURN_INTENT = "ReturnIntent";
  return {
    description: "",
    name: intent.name,
    version: "2",
    fulfillmentActivity: {
      type: RETURN_INTENT,
    },
    sampleUtterances: [],
  };
}

export async function writeResource(
  project: Partial<ProjectResponse>,
  filepath: string
): Promise<void> {
  const [intents, entities, board, { name }] = project.data;
  const data =
    JSON.stringify(
      {
        metadata: {
          schemaVersion: "1.0",
          importType: "LEX",
          importFormat: "JSON",
        },
        resource: {
          name,
          version: "1",
          intents: intents.map(mapIntentToResource),
        },
      },
      null,
      2
    ) + os.EOL;
  await fs.promises.writeFile(filepath, data);
}
