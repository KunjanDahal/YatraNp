import ChatBot from "react-chatbotify";

function Kunjan() {
  const flow = {
    "start": {
      "message": "Hello",
      "user": true,
      "next": "step1"
    },
    "step1": {
      "message": "How are you?",
      "next": "step2"

    },
    "step2": {
      "message": "What is your name?",
      "next": "step3"
    },
    "step3": {
      "message": "Nice to meet you",
      "next": "step4"
    },
    "step4": {
      "message": "Goodbye",
      "next": "end"
    },
    "end": {
      "message": "Bye",
      "next": null
    }
  };

  return (
    <>
      <div>
        <ChatBot flow={flow}  />
      </div>
    </>
  );
}

export default Kunjan;
