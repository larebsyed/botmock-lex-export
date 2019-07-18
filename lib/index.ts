import fs from "fs";
import os from "os";
import { symmetricWrap } from "@botmock-api/utils";
import { ProjectIntent, ProjectResponse, ResourceIntent } from "./types";

export { ProjectResponse } from "./types";
export { default as getProjectData } from "./client";

function createMessageFromContent(
  content: string,
  contentType: string = "PlainText"
) {
  return { content, contentType };
}

function mapIntentToResource(intent: ProjectIntent): Partial<ResourceIntent> {
  const RETURN_INTENT = "ReturnIntent";
  return {
    description: "",
    name: intent.name,
    version: "2",
    fulfillmentActivity: {
      type: RETURN_INTENT,
    },
    sampleUtterances: intent.utterances.map(utterance =>
      symmetricWrap(utterance.text, { l: "{", r: "}" })
    ),
    slots: [],
    // rejectionStatement: {
    //   messages: [{ contentType: PLAIN_TEXT, content: ".." }],
    // },
    // confirmationPrompt: {
    //   messages: [{ contentType: PLAIN_TEXT, content: ".." }],
    //   maxAttempts: 1,
    // },
    // conclusionStatement: {
    //   messages: [{ contentType: PLAIN_TEXT, content: ".." }],
    //   responseCard: JSON.stringify({ version: 1 }),
    // },
  };
}

export async function writeResource(
  project: Partial<ProjectResponse>,
  filepath: string
): Promise<void> {
  const [intents, entities, board, { name }] = project.data;
  const SESSION_TTL_SECS = 800;
  const FALLBACK_INTENT_CONTENT =
    "I didn't understand you, what would you like me to do?";
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
          slotTypes: [],
          childDirected: false,
          voiceId: "Salli",
          locale: "en-US",
          idleSessionTTLInSeconds: SESSION_TTL_SECS,
          description: name,
          clarificationPrompt: {
            messages: [createMessageFromContent(FALLBACK_INTENT_CONTENT)],
            maxAttempts: 2,
          },
          // abortStatement: {},
        },
      },
      null,
      2
    ) + os.EOL;
  await fs.promises.writeFile(filepath, data);
}
