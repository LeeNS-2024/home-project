
// 댓글 목록이 출력되는 영역(ul을 감싸는 div)
const commentListArea = document.querySelector(".comment-list-area");

/** 댓글 목록 조회 함수(ajax)
 */
const selectCommentList = () => {

  // boardNo : 게시글 번호(boardDetail.js 전역 변수) // 쿼터스트링이면 GET 방식
  fetch("/board/commentList?boardNo=" + boardNo)
  .then(response => {
    // response.ok : HTTP 응답 상태 코드가 200번대(성공)이면 true
    if(response.ok) return response.text();
    throw new Error("댓글 목록 조회 실패")
  })
  .then(html => {
    // 매개 변수 html : 타임리프가 해석되어 완성된 html 코드
    // console.log(html); 

    // 타임리프가 해석된 html 코드를
    // .comment-list-area의 내용으로 대입 후 HTML 코드 해석
    commentListArea.innerHTML = html;

    /* [주의 사항] */
    // innerHTML로 새로 만들어진 요소에는
    // 이벤트 리스너가 추가되어 있지 않기때문에
    // 답글, 수정, 삭제 등이 동작하지 않는다!!
    // 그래서 이벤트를 추가해줘야 한다

    addEventChildComment(); // 답글 버튼에 클릭 이벤트 추가
    addEventDeleteComment(); // 삭제 버튼에 클릭 이벤트 추가
    addEventUpdateComment(); // 수정 버튼에 클릭 이벤트 추가

  })
  .catch(err => console.error(err));
};

// ---------------------------------------------------------

// 댓글 내용 요소
const commentContent = document.querySelector("#commentContent");

/** 댓글 등록 함수(AJAX)
 *  @param parentCommentNo : 부모 댓글 번호(없음 undefined)
 */
const insertComment = (parentCommentNo) => {

  // 서버에 제출할 값을 저장할 객체
  const data = {};
  //     K            =    V
  data.boardNo        = boardNo; // 댓글이 작성된 게시글 번호
  data.commentContent = commentContent.value; // 작성된 댓글 내용

  // 매개 변수로 전달받은 부모 댓글 번호가 있다면 == 답글
  if(parentCommentNo !== undefined){
    data.parentCommentNo = parentCommentNo;
    
    // 답글에 작성된 내용 얻어오기
    data.commentContent = document.querySelector(".child-comment-content").value;
  }

  // Ajax
  fetch("/comment", {
    method  : "POST", // 문자열 POST (변수명 POST X) // POST는 삽입요청 즉, 댓글 작성으로 해석
    headers : {"Content-Type" : "application/json"},
    body    : JSON.stringify(data) // JS 객체 -> JSON (문자열)
    // controller? serviceImpl? 에서 받은 값을 아래에 넣음~
  })
  .then(response => {
    if(response.ok) return response.text(); // 텍스트로 파싱해줌
    throw new Error("댓글 등록 실패");
  })
  .then(commentNo => {
    if(commentNo == 0){ // 등록 실패
      alert("댓글 등록 실패");
      return;
    }

    alert("댓글이 등록 되었습니다.")
    commentContent.value = ""; // texttarea에 작성한 댓글 내용 삭제
    selectCommentList(); // 댓글 목록 비동기 조회 후 출력
  })
  .catch(err => console.error(err));
}

/**  답글 버튼 클릭 시
    해당 댓글에 답글 작성 영역을 추가하는 함수 
    @param btn : 클릭된 답글 버튼
*/ 
const showChildComment = (btn) => {

  /* 로그인이 되어 있지 않은 경우  */
  if(loginCheck === false){
    alert("로그인 후 이용해주세요");
    return;
  }

    // ** 답글 작성 textarea가 한 개만 열릴 수 있도록 만들기 **
    const temp = document.getElementsByClassName("child-comment-content");

    if (temp.length > 0) { // 답글 작성 textara가 이미 화면에 존재하는 경우
  
      if (confirm("다른 답글을 작성 중입니다. 현재 댓글에 답글을 작성 하시겠습니까?")) {
        temp[0].nextElementSibling.remove(); // 버튼 영역부터 삭제
        temp[0].remove(); // textara 삭제 (기준점은 마지막에 삭제해야 된다!)
  
      } else {
        return; // 함수를 종료시켜 답글이 생성되지 않게함.
      }
    }
  
  // 클릭된 답글 버튼이 속해있는 댓글(li) 요소 찾기
  const li = btn.closest("li"); // closest("태그") : 부모 중 가장 가까운 태그 찾기

  // 답글이 작성되는 댓글(부모 댓글) 번호 얻어오기
  const parentCommentNo = li.dataset.commentNo;

  
  // 답글을 작성할 textarea 요소 생성
  const textarea = document.createElement("textarea");
  textarea.classList.add("child-comment-content");

  li.append(textarea);

  // 답글 버튼 영역 + 등록/취소 버튼 생성 및 추가
  const commentBtnArea = document.createElement("div");
  commentBtnArea.classList.add("comment-btn-area");

  const insertBtn = document.createElement("button");
  insertBtn.innerText = "등록";

  /* 등록 버튼 클릭 시 댓글 등록 함수 호출(부모 댓글 번호 전달)  */
  insertBtn.addEventListener("click", () => insertComment(parentCommentNo));

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "취소";
  // cancelBtn.setAttribute("onclick", "insertCancel(this)");

  /* 취소 버튼 클릭 시 답글 작성 화면 삭제 */
  cancelBtn.addEventListener("click", () => {

    // console.log(li.lastElementChild);
    li.lastElementChild.remove(); // li (부모요소에) lastElementChild (마지막 자식 요소)
    li.lastElementChild.remove();
  });

  // 답글 버튼 영역의 자식으로 등록/취소 버튼 추가
  commentBtnArea.append(insertBtn, cancelBtn);

  // 답글 버튼 영역을 화면에 추가된 textarea 뒤쪽에 추가
  textarea.after(commentBtnArea);
}

/** 댓글 삭제 함수(Ajax)
 * @param {*} btn : 삭제 버튼
 */
const deleteComment = (btn) => {

  // confirm() 취소 시
  if(confirm("정말 삭제 하시겠습니까?") === false){
    return;
  }

  // 삭제할 댓글 번호 얻어오기
  const li = btn.closest("li"); // 댓글 또는 답글
  const commentNo = li.dataset.commentNo; // 댓글 번호

  fetch("/comment", {
    method : "DELETE",
    headers : {"Content-Type" : "application/json"},
    body : commentNo
  })
  .then(response => { // fetch를 실행했을때 여기로 값을 받을래
    if(response.ok) return response.text();
    throw new Error("댓글 삭제 실패");
  })
  .then(result => {
    if(result > 0){
      alert("삭제되었습니다");
      selectCommentList(); // 댓글 목록 비동기 조회 후 출력
    } else    alert("삭제 실패");
  })
  .catch(err => console.error(err));
}

/* 백업된 댓글을 저장할 변수 */
let beforeCommentRow;

/** 댓글 수정 화면으로 전환
 * @param btn : 수정 버튼
 */
const showUpdateComment = (btn) => {

  /* 댓글 수정 화면이 1개만 열려 있을 수 있게 하기 */
  // == 이미 열려있는 수정 화면이 있으면 닫아버리기

  const temp = document.querySelector(".update-textarea");

  if(temp != null){ // 이미 열려있는 수정 화면이 있을 경우
    
    if(confirm("수정중인 댓글이 있습니다." + "현재 댓글을 수정하시겠습니까?") === true){
      
      const commentRow = temp.parentElement; // 열려있는 댓글행
      commentRow.after(beforeCommentRow); // 백업본을 다음 요소로 추가
      commentRow.remove(); // 열려있던 행 삭제

      // 백업본 버튼에 이벤트 추가
      const childeCommentBtn = beforeCommentRow.querySelector(".child-comment-btn");
      const updateCommentBtn = beforeCommentRow.querySelector(".update-comment-btn");
      const deleteCommentBtn = beforeCommentRow.querySelector(".delete-comment-btn");

      childeCommentBtn.addEventListener("click", () => showChildComment(childeCommentBtn));
      updateCommentBtn.addEventListener("click", () => showUpdateComment(updateCommentBtn));
      deleteCommentBtn.addEventListener("click", () => deleteComment(deleteCommentBtn));
    } else{
      return;
    }
  }

  // 1. 수정하려는 댓글(li) 요소 얻어오기
  const commentRow = btn.closest("li");
  const commentNo = commentRow.dataset.commentNo; // 댓글 번호

  // 2. 취소 버튼 동작에 대비하여
  //    현재 댓글 (commentRow)의 요소를 복제해서 백업
  beforeCommentRow = commentRow.cloneNode(true);
  
  /* 요소.cloneNode(true);
    - 요소 복제하여 반환
    - 매개변수 true : 복제하려는 요소의 하위 요소들도 복제
  */

  // 3. 기존 댓글에 작성된 내용만 얻어오기 
  let beforeContent = commentRow.children[1].innerText;

  // 4. 댓글 행 내부를 모두 삭제
  commentRow.innerHTML = "";

  // 5. textarea 생성 + 클래스 추가 + 내용 추가
  const textarea = document.createElement("textarea");
  textarea.classList.add("update-textarea");
  textarea.value = beforeContent;

  // 6. 댓글 행에 textarea 추가
  commentRow.append(textarea);

  // 7. 버튼 영역 생성
  const commentBtnArea = document.createElement("div");
  commentBtnArea.classList.add("comment-btn-area");
  
  // 8. 수정 버튼 생성
  const updateBtn = document.createElement("button");
  updateBtn.innerText = "수정";

  // 수정 버튼 클릭 시 댓글 수정 (ajax)
  updateBtn.addEventListener("click", () => {
    const data = {
      "commentNo"       : commentNo,
      "commentContent"  : textarea.value 
    }

    fetch("/comment", {
      method  : "PUT",
      headers : {"content-Type" : "application/json"},
      body    : JSON.stringify(data)
    })
    .then(response => {
      if(response.ok) return response.text();
      throw new Error("댓글 수정 실패");
    })
    .then(result => {
      if(result > 0){
        alert("댓글이 수정 되었습니다.");
        selectCommentList(); // 댓글 목록 비동기 조회
      } else {
        alert("댓글 수정 실패");
      }
    })
    .catch(err => console.error(err));
  })

  // 9. 취소 버튼 생성
  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "취소";

  cancelBtn.addEventListener("click", () => {

    // 취소 안 함 -> 수정 진행
    if(confirm("취소하시겠습니까?") === false) return;

    // 현재 댓글 행 다음위치에 백업한 원본 댓글 추가
    commentRow.after(beforeCommentRow);
    commentRow.remove(); // 수정 화면으로 변환된 행 삭제


    /* 원상 복구된 댓글의 버튼에 이벤트 추가하기 */
    const childCommentBtn 
      = beforeCommentRow.querySelector(".child-comment-btn");

    childCommentBtn.addEventListener("click", () => {
      showChildComment(childCommentBtn);
    });


    const updateCommentBtn 
      = beforeCommentRow.querySelector(".update-comment-btn");

    updateCommentBtn.addEventListener("click", () => {
      showUpdateComment(updateCommentBtn);
    });


    const deleteCommentBtn 
      = beforeCommentRow.querySelector(".delete-comment-btn");

    deleteCommentBtn.addEventListener("click", () => {
      deleteComment(deleteCommentBtn);
    })

  })

  // 10. 버튼 영역에 수정/취소 버튼 추가 후
  //     댓글 행에 버튼 영역 추가
  commentBtnArea.append(updateBtn, cancelBtn);
  commentRow.append(commentBtnArea);


  

}

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
/* 이벤트 추가 구문을 모아두는 영역 */

/* 댓글 등록 버튼 클릭 동작 추가 */
const addComment = document.querySelector("#addComment");
addComment.addEventListener("click", () => {

  //  1) 로그인 여부 검사(boardDetail.html의 lohinCheck 전역변수)
  if(loginCheck === false){
    alert("로그인 후 이용해 주세요");
    return;
  }
  // 2) 댓글 작성 여부 검사
  if(commentContent.value.trim().length === 0){
    alert("내용 작성 후 등록 버튼을 클릭해주세요");
    return;
  }
  // 3) 1,2 통과 시 댓글 등록 함수 호출
  insertComment();
})

/* 화면에 존재하는 답글 버튼을 모두 찾아 이벤트 리스너 추가 */

const addEventChildComment = () => {

  const btns = document.querySelectorAll(".child-comment-btn");

  // forEach : 향상된 for 문
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      showChildComment(btn); // 답글 작성 화면 출력 함수 호출
    });
  })
}

/* 화면 코드 해석 완료 후 */
document.addEventListener("DOMContentLoaded", () => {
  addEventChildComment(); // 답글 버튼에 이벤트 추가
});

/** 화면에 존재하는 모든 댓글 삭제 버튼에 
 *  이벤트 리스너 추가하는 함수
 */
const addEventDeleteComment = () => {
  const btns = document.querySelectorAll(".delete-comment-btn");

  btns.forEach(btn => {
    btn.addEventListener("click",  () => {
      deleteComment(btn); // 클릭 시 deleteComment() 함수 호출
    })
  });
}


/** 화면에 존재하는 댓글 수정 버튼에 이벤트 리스너 추가
 */
const addEventUpdateComment = () => {
  const btns = document.querySelectorAll(".update-comment-btn");

  btns.forEach(btn =>{
    btn.addEventListener("click", () =>{
      showUpdateComment(btn);
      // 수정버튼 클릭 시 showUpdateComment() 호출
    })
  })
}




/* 화면 코드 해석 완료 후*/
document.addEventListener("DOMContentLoaded", () => {
  addEventChildComment();  // 답글 버튼에 이벤트 추가
  addEventDeleteComment(); // 삭제 버튼에 이벤트 추가
  addEventUpdateComment(); // 수정 버튼에 이벤트 추가
});





// ---------------------------------------
// Restful -> REST 를 잘 지킨..
/* REST(REpresentational State Transfer)  API

- 자원(데이터,파일)을 이름(주소)으로 
  구분(representational) 하여
  자원의 상태(State)를 주고 받는 것(Transfer)

 -> 자원의 이름(주소)를 명시하고
   HTTP Method(GET,POST,PUT,DELETE) 를 이용해
   지정된 자원에 대한 CRUD 진행

  자원의 이름(주소)는 하나만 지정 (ex. /comment)
   
  삽입 == POST    (Create)
  조회 == GET     (Read)
  수정 == PUT     (Update)
  삭제 == DELETE  (Delete)
*/