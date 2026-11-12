
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

# 문제 목록에서 ID 중복 여부를 검사
def validate_duplicate_ids(questions):

    # 이미 등장한 문제 ID와 첫 등장 줄 번호를 저장 
    seen_ids = {}

    # 문제 목록을 줄 번호와 함께 순회
    for line_number, question in enumerate(questions, start=1):
        question_id = question["id"]

        # 이미 등장한 ID라면 오류 발생
        if question_id in seen_ids:
            first_line = seen_ids[question_id]
            raise ValueError(
                f"{line_number}번째 줄: 문제 ID '{question_id}'가 중복되었습니다. "
                f"(이미 {first_line}번째 줄에 존재하는 ID입니다.)"
            )

        # 처음 등장한 ID라면 줄 번호와 함께 저장
        seen_ids[question_id] = line_number



# 각 문제의 document_id가 실제 업로드된 PDF의 document_id와 일치하는지 검증
def validate_document_id(questions, expected_document_id):

    # 생성된 문제를 줄 번호와 함께 검사
    for line_number, question in enumerate(questions, start=1):

        # 문제에 저장된 문서 ID
        document_id = question["document_id"]

        # 실제 업로드된 PDF의 ID와 비교
        if document_id != expected_document_id:
            raise ValueError(
                f"{line_number}번째 줄: 문서 ID 불일치 - 문제 {question['id']} "
                f"(기대값: {expected_document_id}, 실제값: {document_id})"
            )


# 문제의 출처 페이지가 실제 PDF의 페이지 범위 안에 있는지 검증
def validate_source_page(questions, total_pages):

    # 문제를 줄 번호와 함께 검사 
    for line_number, question in enumerate(questions, start=1):
        source_page = question["source_page"]

        # 페이지 번호는 1부터 PDF 전체 페이지 수까지 허용
        if not (1 <= source_page <= total_pages):
            raise ValueError(
                f"{line_number}번째 줄: 페이지 범위 오류 - 문제 {question['id']} "
                f"(페이지: {source_page}, PDF 전체: {total_pages}페이지)"
            )


# 문제의 출처 문장이 실제 PDF의 해당 페이지에 존재하는지 검증
def validate_source_excerpt(questions, page_texts):

    # 문제를 하나씩 검사
    for question in questions:
        source_page = question["source_page"]
        source_excerpt = question["source_excerpt"]

        # 해당 페이지에서 추출한 텍스트 가져오기
        page_text = page_texts.get(source_page)

        # 해당 페이지의 텍스트가 없는 경우
        if page_text is None:
            raise ValueError(
                f"페이지 텍스트 없음: 문제 {question['id']} "
                f"(페이지: {source_page})"
            )

        # 출처 문장이 해당 페이지에 존재하는지 확인
        if source_excerpt not in page_text:
            raise ValueError(
                f"출처 문장 불일치: 문제 {question['id']} "
                f"(페이지: {source_page})"
            )

# JSONL 문제 데이터를 파싱하고 모든 검증을 순서대로 실행하는 통합 함수
def validate_questions(jsonl_text, expected_document_id, total_pages, page_texts):

    # 1. JSONL 파싱
    questions = parse_jsonl(jsonl_text)

    # 2. 개별 문제 검증
    for line_number, question in enumerate(questions, start=1):
        try:
            validate_required_fields(question)
            validate_field_types(question)
            validate_non_empty_strings(question)
            validate_difficulty(question)
            validate_answer_index(question)
        except ValueError as e:
            question_id = question.get("id", "알 수 없음")
            raise ValueError(
                f"{line_number}번째 줄 (문제 ID: {question_id}): {e}"
            ) from e

    # 3. 전체 문제 목록 및 PDF 정보 검증
    validate_duplicate_ids(questions)
    validate_document_id(questions, expected_document_id)
    validate_source_page(questions, total_pages)
    validate_source_excerpt(questions, page_texts)

    # 4. 모든 검증을 통과한 문제 목록 반환
    return questions



# 이 파일을 직접 실행했을 때만 테스트 코드 실행
if __name__ == "__main__":

    # JSONL 형식의 테스트 데이터 (문제 2개)
    test_jsonl = """{"id":"q001","document_id":"doc001","difficulty":"하","question":"CPU의 역할은?","options":["연산","출력"],"answer_index":0,"explanation":"CPU는 연산을 수행합니다.","source_page":1,"source_excerpt":"CPU는 연산을 수행한다."}
{"id":"q002","document_id":"doc001","difficulty":"중","question":"RAM의 역할은?","options":["임시 저장","화면 출력"],"answer_index":0,"explanation":"RAM은 데이터를 임시 저장합니다.","source_page":2,"source_excerpt":"RAM은 데이터를 임시 저장한다."}"""

    # 테스트용 PDF 정보
    expected_document_id = "doc001"
    total_pages = 10

    page_texts = {
        1: "CPU는 연산을 수행한다.",
        2: "RAM은 데이터를 임시 저장한다."
    }

    # 모든 검증을 통합 함수 하나로 실행
    result = validate_questions(
        test_jsonl,
        expected_document_id,
        total_pages,
        page_texts
    )

    # 모든 검증을 통과한 경우에만 출력
    print(f"모든 문제 검증 통과! 총 {len(result)}개")
