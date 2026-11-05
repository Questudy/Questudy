
import json # JSON 문자열을 Python 데이터로 변환하기 위한 기본 라이브러리

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


# 이 파일을 직접 실행했을 때만 테스트 코드 실행
if __name__ == "__main__":

    # JSONL 형식의 테스트 데이터 (문제 2개)
    test_jsonl = """{"id":"q001","difficulty":"하"}
                    {"id":"q002","difficulty":"중"}"""

    # 위에서 만든 함수에 테스트 데이터 전달
    result = parse_jsonl(test_jsonl)

    # 파싱 결과 출력
    print(result)
