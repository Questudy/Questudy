
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

# 각 필드가 가져야 하는 자료형 정의
FIELD_TYPES = {
    "id": str,
    "document_id": str,
    "difficulty": str,
    "question": str,
    "options": list,
    "answer_index": int,
    "explanation": str,
    "source_page": int,
    "source_excerpt": str,
}

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

# 문제 하나의 필드 자료형을 검사하는 함수 
def validate_field_types(question):

    # 필드명과 예상 자료형을 하나씩 꺼내서 검사
    for field, expected_type in FIELD_TYPES.items():

         # 실제 자료형이 예상 자료형과 다르면 오류 발생
        if type(question[field]) is not expected_type:
            raise ValueError(
                f"자료형 오류: {field}는 {expected_type.__name__}이어야 합니다."
            )

    # options 리스트 내부의 보기들도 문자열인지 확인
    for index, option in enumerate(question["options"]):
        if not isinstance(option, str):
            raise ValueError(
                f"자료형 오류: options[{index}]는 문자열이어야 합니다."
            )


# 문자열 필드와 보기의 빈 값 검사
def validate_non_empty_strings(question):

    # 문자열 필드 검사
    for field, value in question.items():
        if isinstance(value, str) and not value.strip():
            raise ValueError(f"빈 문자열 오류: {field}")

    # 객관식 보기 검사
    for index, option in enumerate(question["options"]):
        if not option.strip():
            raise ValueError(f"빈 문자열 오류: options[{index}]")


# 난이도가 하, 중, 상 중 하나인지 검사
def validate_difficulty(question):

    allowed_difficulties = ["하", "중", "상"]

    if question["difficulty"] not in allowed_difficulties:
        raise ValueError(
            f"난이도 오류: {question['difficulty']}"
        )


# 보기 개수와 정답 인덱스가 올바른지 검사
def validate_answer_index(question):

    options = question["options"]
    answer_index = question["answer_index"]

    # 객관식 보기 개수는 최소 2개
    if len(options) < 2:
        raise ValueError("보기 개수 오류: 최소 2개가 필요합니다.")

    # 정답 인덱스가 실제 보기 범위 안에 있는지 검사
    if not (0 <= answer_index < len(options)):
        raise ValueError(
            f"정답 인덱스 오류: {answer_index}"
        )






# 이 파일을 직접 실행했을 때만 테스트 코드 실행
if __name__ == "__main__":

    # JSONL 형식의 테스트 데이터 (문제 2개)
    test_jsonl = """{"id":"q001","document_id":"doc001","difficulty":"상","question":"CPU의 역할은?","options":["연산", "제어"],"answer_index": 0,"explanation":"CPU는 연산을 수행합니다.","source_page":1,"source_excerpt":"CPU는 연산을 수행한다."}"""

    # 1. JSONL을 Python 딕셔너리 목록으로 변환
    result = parse_jsonl(test_jsonl)

    # 2. 문제별 검증
    for question in result:
        validate_required_fields(question)
        validate_field_types(question)
        validate_non_empty_strings(question)
        validate_difficulty(question)      
        validate_answer_index(question)

     # 3. 모든 문제가 검증을 통과한 경우에만 출력
    print("모든 문제의 필수 필드 검사 통과")
