import axios from "axios";

export async function promptGemini(data) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/ai/chat_with_unihelp/",
      data,
    );

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.error || err.message || "Something went wrong",
        { cause: err },
      );
    }

    throw new Error("Unexpected error occurred", { cause: err });
  }
}
