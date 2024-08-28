const OpenAI =  require("openai");
const openai = new OpenAI();

function extractCode(input) {
    const regex = /```[\w-]+\s([\s\S]*?)```/;
    const match = input.match(regex);
    return match ? match[1].trim() : input;
}

async function convert(src, language) {
    let systemPrompt = "You are a software developer who's only purpose in life is to convert typescript http client code to other langauges. When asked to do a conversion return only the source code.";
    const prompt = `Convert the following typescript code to ${language}: \n\n${src}`;

    if (language.toLowerCase() === 'swift') {
        const initEg = `
\`\`\`swift
  struct TestOptions: Codable {
    var test: String
    var num: Int

    func initWithDefaults -> TestOptions {
        .init(test: "hello", num: 123)
    }  
  }
\`\`\`
`
        systemPrompt = `${systemPrompt} Consider these rules when converting from TypeScript to Swift:
        - If you're converting an interface or a type then the output should be a struct that implements Codable so it can be used to convert a JSON http response.
        - Always add "import Foundation" to the top of each Swift file.
        - Any TypesScript interfaces who's name starts with I should be converted to a Swift struct with the same name but without the I prefix. Any references to these interfaces should be replaced with the struct name.
        - Any converted enums should implement Codable so they can be used to convert a JSON http response.
        - If any created Swift structs need values to be of another type you're not aware of in this context, don't auto create or stub the missing structs as they will exist in another file and do not need to be assumed. Seriously don't even create a placeholder or stub for it as it causes a redeclaration compile error.
        - Only when you see a default object in the same in the TypeScript code, then create a initWithDefaults func on the struct that is a func that returns the struct type but with the default values provided in the typescript. An example of this is: ${initEg}
        - Do not create the func initWithDefaults on a struct if you do not get default values in the TypeScript code.
        - Do not define any Swift structs inside other structs, they should all be defined at the top level.
        `;

        // //Client specific prompt
        // systemPrompt = `${systemPrompt}
        // If any client code is referencing a struct don't auto create these as they will be provided in another file.
        // If \`options\` are not passed to a client function use the same default values as the TypeScript code, they will be provided in a separate file. 
        // In the client code and calls to postData or getData, the response should be directly returned instead of assigning to a cariable first and then returning it.
        // In the client don't accept Partial options, just make the options object required.
        // options passed to client functions are always codable and so should be passed as a JSON object.
        // In the client ignore default options in TypeScript code, Swift will always have the real value passed.
        // `;
        
    }

    const completion = await openai.chat.completions.create({
      messages: [
          { role: "system", content: systemPrompt },
          {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                }
              ]
          }
      ],
      model: "gpt-4",
    });
  
    //Check refusal
    if (completion.choices[0].message.refusal) {
      console.error('Refusal detected');
      throw new Error('Refusal detected');
    }
  
    return extractCode(completion.choices[0].message.content);
}

module.exports = { convert };