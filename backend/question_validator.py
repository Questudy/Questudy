
import json # JSON 문자열을 Python 데이터로 변환하기 위한 기본 라이브러리

# 문제 데이터에 반드시 포함되어야 하는 9개 필드
REQUIRED_FIELDS = [
    "id",
    "document_id",
    "difficulty",
    "question",
    "options",
    "answer_index",
    "explanation",
    "source_page",
    "source_excerpt",
]

# JSONL 문자열을 받아 문제 목록으로 변환하는 함수
def parse_jsonl(jsonl_text):
    questions = []

    for line_number, line in enumerate(jsonl_text.splitlines(), start=1):
        if not line.strip():
            raise ValueError(f"{line_number}번째 줄: 빈 줄입니다.")

        # JSON 문자열을 Python 데이터로 변환 시도
        try:
            question = json.loads(line)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"{line_number}번째 줄: JSON 문법 오류 - {e.msg}"
            ) from e

        if not isinstance(question, dict):
            raise ValueError(
                f"{line_number}번째 줄: JSON 객체여야 합니다."
            )
        
        # 검사를 통과한 문제를 리스트에 추가 
        questions.append(question)

    return questions

# 문제 하나에 필수 필드가 모두 존재하는지 검사 
def validate_required_fields(question):

    for field in REQUIRED_FIELDS:

        # 해당 필드가 문제 데이터에 없다면 오류 발생 
        if field not in question:
            raise ValueError(f"필수 필드 누락: {field}")



# 이 파일을 직접 실행했을 때만 테스트 코드 실행
if __name__ == "__main__":

    # JSONL 형식의 테스트 데이터 (문제 2개)
    test_jsonl = """{"id":"q001","difficulty":"하"}
{"id":"q002","difficulty":"중"}"""

    # 1. JSONL을 Python 딕셔너리 목록으로 변환
    result = parse_jsonl(test_jsonl)

    # 2. 문제 하나씩 필수 필드가 모두 있는지 확인
    for question in result:
        validate_required_fields(question)

     # 3. 모든 문제가 검증을 통과한 경우에만 출력
    print("모든 문제의 필수 필드 검사 통과")
