from nvidia_api import generate_answer

def safety_check(user_query, answer):
    prompt = f"""
Check for unsafe content.

User: {user_query}
Answer: {answer}

If unsafe, rewrite safely. Otherwise return SAFE.
"""
    result = generate_answer(prompt)
    if "SAFE" in result:
        return False, answer
    return True, result
