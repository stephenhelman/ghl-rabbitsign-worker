import { ghlRequest } from "../api/ghlClient";
import { jsonResponse } from "../util/http";
import { confirmBody } from "../util/util";

const signedDocId = "6919437d8bffb23fa41f3666";
const downloadUrl =
  "https://rabbitsign-docs.s3.amazonaws.com/Cash%20-%208723%20Leo%20Street%2C%20El%20Paso%20TX%2079904_5mj50AwGSP3k1O7gpKztGb.zip?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIBdd1eMK8kkIMLRzgDaEiOWkIIe5FymZGctAw6mssgp0AiABqsG%2FmJT0IjvdikxtX6SGn9Qd9pSB9WwowiI5aWZtMSr5AgiM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAMaDDM0ODU1MTI4Mzk2NSIMY66l2aVCwIhG0htoKs0CKz5RAmM71B%2FYWHTUePbSSC5BegqkP8z5QCWuQcR%2FlHpnhzrr5nFz3RNOa%2FX3WM%2BvF3yZmXcrBA2LGgypfrH4Ix7SONpOvUvfSRk1bA4%2FHGtHKPZ26Ju4dYMmbfxAL49AcsGk0RlxfmfE5etHX0up8z7sbKiZhCz316qw6wY%2FgEtCqk%2Fx3%2BcvuhjL0%2F%2BUlwZngi6yYjirromTJmOHI6G9tRcjCYf2FtcPHmvsSJo7MJSAbW2viY0OmVwV7ePQlm8NwP3gn2JB%2FTsYmT3CMFXqQV0P9AJQC9v1RwNoZNzlnwJscUJ4xGe1g6243w%2BnWT7rUqRP109xQf6hMawTN3oQrdmBGmR1QVXN%2B%2FVxUPJO7ceS415uY5uq7K2qUvh72FGLztrWjZRnbq7U4aUiK3xvQ4tnW%2BzwcdVeOcIdYFgkdIi%2Fh1z6n14MtFZxP0AFMPOC5cgGOp8Btz7DLXwQnbveoCyKgIGLNh6Hkcj4AkAZRIrsVj6bcGOHcBS%2FoTzt4yUKZ4HWfv31UHP3eMD%2FWCyfySeghKP1nZjiNkLXuDUuqBaTBHjQD8iz7SARuJr%2FNUDVG3%2BqC%2F5WPj2COI4%2BmmbVLazP9fOiiJP1VJ8a7q26H4NFQxywB%2F4CSYE0kwT%2BP97Ow0qKQozkXwL%2B7F3KNU0kjJpqzcu2&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20251116T032237Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=ASIAVCJ2GQT6YV3AYJ4L%2F20251116%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=dd8ae3154c6f6c77cb0308065fcd4bb032b539d73cf251dadc4a01536b5d60e7";
const customField = "custom_objects.signed_documents.signed_pdf";

export const handleWorkerTest = async (request, env) => {
  // 1. download the pdf
  const download = await fetch(downloadUrl);

  const downloadJson = await download.json();

  console.log(downloadJson);
  // 2. create form data
  // 3. upload it to ghl
  // 4. take the response and update the signed document
};
