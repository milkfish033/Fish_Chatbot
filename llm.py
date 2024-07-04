from volcenginesdkarkruntime import Ark
# fetch ak&sk from environmental variables "VOLC_ACCESSKEY", "VOLC_SECRETKEY"
# or specify ak&sk by Ark(ak="${YOUR_AK}", sk="${YOUR_SK}").
# you can get ak&sk follow this document(https://www.volcengine.com/docs/6291/65568)
#Specify your own Ark here or OPENAI 
client = Ark(ak="***", sk="****")


def QA(info, text)->str:
    answer = ""
    # print(text)
    stream = client.chat.completions.create(
    #lite 32k
    model="*****",
    messages=[
        {
            "role": "user",
            "content": f"read these info{info}, then{text}"
            #template % text,
        },
    ],
    stream=True,
    temperature=1,
    top_p=0.7,
    )
    for chunk in stream:
        if not chunk.choices:
            continue
        answer += chunk.choices[0].delta.content
    return answer

