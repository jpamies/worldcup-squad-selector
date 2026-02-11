# World Cup 2026 Squad Selector - Makefile
# ==========================================

.PHONY: help serve serve-python open clean

# Default target
help:
	@echo.
	@echo  World Cup 2026 Squad Selector
	@echo  ==============================
	@echo.
	@echo  Comandos disponibles:
	@echo.
	@echo    make serve         - Arranca servidor local (npx serve)
	@echo    make serve-python  - Arranca servidor local (Python)
	@echo    make open          - Abre index.html en navegador
	@echo    make clean         - Limpia archivos temporales
	@echo    make status        - Muestra estado del proyecto
	@echo.

# Arrancar servidor con npx serve (puerto 3000)
serve:
	@echo Arrancando servidor en http://localhost:3000
	npx serve . -p 3000

# Arrancar servidor con Python (puerto 8000)
serve-python:
	@echo Arrancando servidor en http://localhost:8000
	python -m http.server 8000

# Abrir directamente en navegador
open:
	@echo Abriendo index.html...
	start index.html

# Limpiar archivos temporales
clean:
	@echo Limpiando archivos temporales...
	-del /q *.log 2>nul
	-del /q *.tmp 2>nul
	@echo Limpieza completada.

# Mostrar estado del proyecto
status:
	@echo.
	@echo  Estado del Proyecto
	@echo  ===================
	@echo.
	@echo  Archivos:
	@dir /b *.html *.css *.js *.md 2>nul
	@echo.
	@echo  Datos disponibles:
	@dir /b data\*.json 2>nul
	@echo.
