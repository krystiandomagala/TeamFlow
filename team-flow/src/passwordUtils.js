export function handleMouseDown(setIsPasswordVisibleFunc) {
    setIsPasswordVisibleFunc(true);
}

export function handleMouseUp(setIsPasswordVisibleFunc) {
    setIsPasswordVisibleFunc(false);
}

export function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      password
    );

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasDigit &&
      hasSpecialChar
    );
  }
