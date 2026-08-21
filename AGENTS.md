# AGENTS.md

<!--
Questo file contiene le istruzioni permanenti che Codex deve seguire
quando lavora su questo repository.

Le regole qui definite devono essere considerate valide per tutti i task,
a meno che il prompt del singolo task non dica esplicitamente il contrario.
-->


# General behavior

<!--
Codex deve prima capire il codice esistente e solo dopo modificarlo.
Serve ad evitare modifiche inutili, duplicazioni o soluzioni che non rispettano
l'architettura già presente nel progetto.
-->

- Read and understand the relevant existing code before making changes.
- Prefer modifying existing implementations instead of creating parallel or duplicate solutions.
- Follow the existing project architecture, naming conventions, and coding style.
- Do not refactor unrelated code unless explicitly requested.
- Keep changes focused on the requested task.


<!--
Questa regola serve a limitare il "raggio d'azione" di Codex.
Se gli chiediamo di sistemare una bug, non deve approfittarne per
ristrutturare altre parti dell'applicazione.
-->

- Do not modify files unrelated to the requested task.
- Avoid unnecessary formatting changes in unrelated files.
- Avoid large-scale rewrites unless explicitly requested.


# Before making changes

<!--
Prima di modificare qualcosa Codex deve individuare i file realmente coinvolti.
Questo riduce il rischio che intervenga nel punto sbagliato del progetto.
-->

- Identify the files involved in the task before editing.
- Inspect related configuration, services, components, workflows, or dependencies when relevant.
- Understand how the current implementation works before replacing or extending it.


<!--
Se una soluzione già presente può essere riutilizzata, Codex deve preferirla.
-->

- Reuse existing utilities, components, services, scripts, and patterns whenever possible.
- Do not introduce a new dependency when the task can reasonably be solved with existing dependencies.


# Implementation principles

<!--
Le modifiche devono essere semplici e mantenibili.
Non vogliamo soluzioni inutilmente complesse.
-->

- Prefer simple and maintainable solutions.
- Avoid unnecessary abstractions.
- Avoid overengineering.
- Keep methods and functions focused on a clear responsibility.
- Use descriptive variable, method, class, component, and file names.


<!--
Quando Codex introduce nuova logica deve cercare di mantenere
la retrocompatibilità con il comportamento esistente.
-->

- Preserve existing behavior unless the task explicitly requires changing it.
- Avoid breaking public APIs, interfaces, configurations, or existing workflows without a clear reason.


# Security

<!--
Questa sezione è particolarmente importante perché il repository può contenere
pipeline CI/CD, configurazioni Firebase, Google Play e altri servizi esterni.
-->

- Never commit passwords, API keys, access tokens, private keys, keystores, certificates, credentials, or other secrets.
- Never hardcode secrets in source code, scripts, configuration files, or workflow files.
- Use environment variables or repository secrets for sensitive values.


<!--
Codex deve fare attenzione anche ai file che potrebbero contenere segreti.
-->

- Before adding sensitive files, verify whether they should be excluded using `.gitignore`.
- Do not add `.jks`, `.keystore`, private certificates, service-account credentials, or secret configuration files to Git.


<!--
Se durante un task Codex trova accidentalmente una credenziale,
non deve copiarla o propagarla.
-->

- If an existing secret or credential is discovered, do not reproduce it in new files, logs, documentation, commits, or Pull Requests.
- Prefer placeholders such as `YOUR_SECRET`, environment variables, or documented secret names.


# Git workflow

<!--
Ogni task deve produrre modifiche Git piccole e comprensibili.
-->

- Keep each change logically focused.
- Do not include unrelated modifications in the same commit.
- Review the final diff before considering the task complete.


# Branch naming

<!--
Vogliamo nomi di branch molto semplici.
Non usare prefissi come codex/, feature/, fix/, chore/, ecc.
-->

- Use short, simple, descriptive branch names.
- Branch names must be lowercase.
- Use hyphens between words.
- Do not prefix branch names with `codex/`.
- Do not prefix branch names with `feature/`, `fix/`, `chore/`, `refactor/`, or similar prefixes unless explicitly requested.
- Prefer approximately 2 to 5 words.


<!--
Esempi dei nomi che vogliamo.
-->

Good examples:

- `app-store-pipeline`
- `android-build-fix`
- `firebase-deploy`
- `outfit-photo-selector`
- `upload-key-reset`
- `google-play-publish`


<!--
Esempi dei nomi troppo lunghi o poco leggibili che vogliamo evitare.
-->

Avoid:

- `codex/evaluate-feasibility-of-automatic-app-store-pipeline`
- `feature/implement-new-automatic-google-play-deployment-system`
- `fix/completely-rework-android-build-and-deployment-pipeline`


# Commit messages

<!--
I messaggi di commit devono essere in inglese perché sono parte
della documentazione tecnica del repository.
-->

- Write commit messages in English.
- Keep commit messages short and descriptive.
- Describe what changed, not the entire history of the task.
- Prefer a single concise sentence.
- Do not mention Codex in commit messages.
- Do not include task IDs unless explicitly requested.


<!--
Esempi di commit corretti.
-->

Good examples:

- `Fix Android build verification`
- `Add Google Play deployment workflow`
- `Update Firebase preview pipeline`
- `Add outfit photo selector`
- `Fix upload key handling`
- `Remove sensitive files from repository`


<!--
Esempi da evitare perché troppo verbosi.
-->

Avoid:

- `Implement all necessary changes requested to evaluate the feasibility of the automatic app store pipeline`
- `Codex changes for task 12345`
- `Various fixes and improvements`


# Pull Request titles

<!--
Questa è la regola che abbiamo introdotto soprattutto per evitare
titoli PR enormi generati automaticamente da Codex.
-->

- Use short and descriptive Pull Request titles.
- Write Pull Request titles in English.
- Prefer approximately 2 to 5 words.
- Describe the main purpose of the change.
- Do not prefix Pull Request titles with `Codex`.
- Do not include task IDs or unnecessary metadata.
- Avoid copying the entire user prompt into the Pull Request title.


<!--
Esempi di PR che vogliamo vedere su GitHub.
-->

Good examples:

- `Fix app store pipeline`
- `Automate Google Play publish`
- `Fix Android build`
- `Update Firebase deployment`
- `Add outfit photo selector`
- `Improve upload key handling`


<!--
Titoli troppo lunghi da evitare.
-->

Avoid:

- `Evaluate feasibility of automatic application store pipeline and implement all required changes`
- `Codex implementation for automatic Google Play Console publishing workflow`
- `Changes requested for task regarding Firebase and Google Play deployment`


# Pull Request descriptions

<!--
Il titolo deve essere corto, ma nella descrizione della PR Codex
può spiegare meglio cosa ha fatto.
-->

- Keep Pull Request descriptions concise and useful.
- Summarize the main changes.
- Mention relevant tests that were executed.
- Mention important limitations or follow-up work when necessary.
- Do not include unnecessary narrative about the development process.


<!--
Una descrizione PR dovrebbe idealmente avere questa struttura.
-->

Preferred format:

## Summary

- Main change
- Secondary change if relevant

## Validation

- Tests executed
- Build or verification performed

## Notes

- Important limitations or follow-up information, only when needed


# Testing and validation

<!--
Prima di considerare concluso un task Codex deve verificare,
per quanto possibile, che quello che ha modificato funzioni.
-->

- Run relevant tests when available.
- Run the relevant build when reasonable.
- Validate configuration files when possible.
- Check for syntax errors.
- Verify that modified workflows or scripts are internally consistent.


<!--
Non deve però sistemare automaticamente test falliti che non c'entrano
con il task corrente.
-->

- If unrelated tests already fail, report them instead of modifying unrelated code to make them pass.
- Do not hide, disable, or remove failing tests simply to obtain a successful build.


# CI/CD workflows

<!--
Questa sezione riguarda GitHub Actions, Firebase, Android e Google Play.
Codex deve essere particolarmente prudente perché queste configurazioni
possono pubblicare realmente applicazioni.
-->

- Treat CI/CD changes as production-impacting changes.
- Preserve existing deployment safeguards unless explicitly requested otherwise.
- Do not weaken security checks merely to make a pipeline pass without explaining the consequence.
- Prefer explicit and understandable workflow steps.
- Avoid duplicating existing workflow logic.


<!--
Le credenziali delle pipeline devono sempre arrivare dai GitHub Secrets.
-->

- Reference sensitive CI/CD values through GitHub Secrets or environment variables.
- Never print secrets in workflow logs.
- Avoid commands that may expose credentials in standard output.


# Android and Google Play

<!--
Regole specifiche per la parte Android di Come Mi Vesto.
-->

- Never commit Android keystores or signing passwords.
- Keep signing credentials outside the repository.
- Use GitHub Secrets or equivalent secure secret storage for signing credentials.
- Do not regenerate signing keys unless explicitly requested.
- Do not replace an existing signing configuration without first understanding its impact.


<!--
La firma Android è delicata: modificare una chiave sbagliata
può impedire la pubblicazione di nuove versioni dell'app.
-->

- Treat upload keys and application signing keys as different concepts.
- Preserve compatibility with the existing Google Play signing configuration.
- Do not change package identifiers or application IDs unless explicitly requested.


# Firebase

<!--
Regole per evitare modifiche pericolose alla configurazione Firebase.
-->

- Reuse the existing Firebase configuration whenever possible.
- Do not create new Firebase projects unless explicitly requested.
- Do not expose Firebase service-account credentials.
- Keep environment-specific configuration clearly separated when needed.


# Frontend

<!--
Come Mi Vesto utilizza un frontend Angular/Ionic.
Codex deve seguire l'architettura già presente invece di introdurre
pattern arbitrari.
-->

- Follow the existing Angular and Ionic project structure.
- Reuse existing components and services when appropriate.
- Avoid duplicating business logic across components.
- Keep UI changes consistent with the existing application style.
- Preserve mobile compatibility.


# Backend

<!--
Regole generali per eventuali modifiche al backend Node.js.
-->

- Follow the existing backend architecture.
- Keep API behavior backward compatible unless explicitly requested.
- Validate incoming data where appropriate.
- Handle errors explicitly.
- Avoid exposing internal errors or sensitive information to API clients.


# Dependencies

<!--
Non vogliamo installare librerie a caso per risolvere problemi semplici.
-->

- Do not add a new dependency unless it provides a clear benefit.
- Prefer existing project dependencies when they already solve the problem.
- When adding a dependency, use a maintained and appropriate package.
- Do not upgrade unrelated dependencies as part of another task.


# Documentation

<!--
La documentazione va aggiornata solo quando la modifica introduce
qualcosa che un futuro sviluppatore deve conoscere.
-->

- Update documentation when a change introduces new setup steps, configuration, environment variables, or important behavior.
- Keep documentation concise.
- Do not create unnecessary documentation files for trivial changes.


# Comments in source code

<!--
I commenti nel codice devono spiegare il perché di una scelta,
non semplicemente tradurre quello che il codice già dice.
-->

- Add source-code comments only when they provide useful context.
- Prefer explaining why something is necessary rather than describing obvious code.
- Avoid excessive comments.


# Final task review

<!--
Questa è la checklist che Codex deve mentalmente seguire prima
di dichiarare concluso il lavoro.
-->

Before completing a task:

1. Review the final diff.
2. Verify that only relevant files were changed.
3. Check for accidentally committed secrets.
4. Run relevant tests or builds when possible.
5. Verify that no unrelated behavior was changed.
6. Use a short English commit message.
7. Use a short English Pull Request title.
8. Clearly report any validation that could not be performed.


# Communication

<!--
Quando Codex ci presenta il risultato finale deve essere concreto:
cosa ha cambiato, cosa ha verificato e cosa eventualmente resta da fare.
-->

- Keep final explanations concise and technical.
- Clearly state what was changed.
- Clearly state what was tested.
- Explicitly mention anything that could not be verified.
- Do not claim that something works unless it was actually verified.
