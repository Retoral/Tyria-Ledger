!macro customCheckAppRunning
  DetailPrint "Checking for a running Tyria Ledger process."

  nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
  Pop $R0
  StrCmp $R0 0 0 done

  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "Tyria Ledger is still running. The installer will close it before continuing." /SD IDOK IDOK closeApp
  Quit

  closeApp:
    nsProcess::_CloseProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
    Pop $R0
    Sleep 1500

    nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
    Pop $R0
    StrCmp $R0 0 0 done

    ExecWait '"$SYSDIR\taskkill.exe" /IM "${APP_EXECUTABLE_FILENAME}" /T /F'
    Sleep 1000

    nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
    Pop $R0
    StrCmp $R0 0 0 done

    MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Tyria Ledger could not be closed. Close every Tyria Ledger process in Task Manager, then retry." /SD IDCANCEL IDRETRY closeApp
    Quit

  done:
!macroend
