import LLM "mo:llm";

actor {
  stable var history : [LLM.ChatMessage] = [];

  public func chat(messages : [LLM.ChatMessage]) : async Text {
    history := messages;

    let response = await LLM.chat(#Llama3_1_8B)
      .withMessages(history)
      .send();

    switch (response.message.content) {
      case (?text) text;
      case null "";
    };
  };
};
