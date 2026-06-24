!macro customCheckAppRunning
  DetailPrint "Checking for a running Tyria Ledger process."

  nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
  Pop $R0
  StrCmp $R0 0 0 done

  DetailPrint "Closing Tyria Ledger before installing."
  nsProcess::_CloseProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
  Pop $R0
  Sleep 1500

  nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
  Pop $R0
  StrCmp $R0 0 0 done

  DetailPrint "Force-closing Tyria Ledger before installing."
  ExecWait '"$SYSDIR\taskkill.exe" /IM "${APP_EXECUTABLE_FILENAME}" /T /F'
  Sleep 1000

  nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
  Pop $R0
  StrCmp $R0 0 0 done

  DetailPrint "Tyria Ledger still appears to be running, continuing repair install anyway."

  done:
!macroend

!macro customInstall
  DetailPrint "Updating Windows Installed Apps metadata."
  WriteRegStr SHELL_CONTEXT "${UNINSTALL_REGISTRY_KEY}" "DisplayName" "Tyria Ledger"
  WriteRegStr SHELL_CONTEXT "${UNINSTALL_REGISTRY_KEY}" "DisplayVersion" "${VERSION}"
!macroend

!macro recoverFromOldUninstallerFailure ROOT_CONTEXT
  !define UniqueID ${__LINE__}
  IfErrors 0 checkExitCode_${UniqueID}
    DetailPrint "The previous Tyria Ledger uninstaller could not be launched from ${ROOT_CONTEXT}. Continuing with a repair install."
    ClearErrors
    StrCpy $R0 0
    Return

  checkExitCode_${UniqueID}:
    ${if} $R0 != 0
      DetailPrint "The previous Tyria Ledger uninstaller returned $R0 from ${ROOT_CONTEXT}. Continuing with a repair install."
      StrCpy $R0 0
    ${endif}
  !undef UniqueID
!macroend

!macro customUnInstallCheck
  !insertmacro recoverFromOldUninstallerFailure "SHELL_CONTEXT"
!macroend

!macro customUnInstallCheckCurrentUser
  !insertmacro recoverFromOldUninstallerFailure "HKEY_CURRENT_USER"
!macroend
