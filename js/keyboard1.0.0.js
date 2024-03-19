let currentInputIndex = 1;
let isFull = false
let password = ''

function inputNumber(num) {
  const boxId = 'box' + currentInputIndex;
  const box = document.getElementById(boxId);
  if (box.textContent.length === 0) {
    password += num
    box.textContent = num;
    if (currentInputIndex < 4) {
      currentInputIndex++;
    }else{
        isFull = true
    }
    
    checkKeyboardStatus();
  }
}


function confirmNumber() {
    if(password.length < 4){

    }
}

function deleteNumber() {
  if (currentInputIndex > 1 && document.getElementById('box' + currentInputIndex).textContent === '') {
      currentInputIndex--;
  }
  isFull = false
  password = password.slice(0, currentInputIndex - 1)
  const boxId = 'box' + currentInputIndex;
  const box = document.getElementById(boxId);
  box.textContent = '';
  checkKeyboardStatus();
}

function clearPassword(){
    
    let inputs = document.querySelectorAll('.display-box')
    inputs.forEach(input => {
        input.textContent = ''
    })
    password = ''
    currentInputIndex = 1
    isFull = false
    checkKeyboardStatus()
}

function checkKeyboardStatus() {
  const keys = document.querySelectorAll('.key');
  const keysLength = keys.length
  keys.forEach((key, index) => {
    if (isFull === true && index + 1 < keysLength) {
      key.classList.add('disabled');
    } else {
      key.classList.remove('disabled');
    }
  });
}