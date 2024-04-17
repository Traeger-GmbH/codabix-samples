@echo on
set NODE_VER=null
node -v >tmp.txt
set /p NODE_VER=<tmp.txt
del tmp.txt

IF %NODE_VER% == null (
  echo Node version not found. Please install node.js from http://nodejs.org.
  ) ELSE (
  echo %NODE_VER%
  
  echo Initializing npm...
  call npm init -y
  
  echo Installing TypeScript...
  call npm install typescript --save-dev
  
  echo Initizializing TypeScript...
  call npx tsc --init
  
  echo Installing Codabix Debugging Runtime
  call npm install @traeger-industry/codabix-debug-runtime

  echo Project setup successful.
    )
    
pause
exit
