# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.7] - 2025-07-23

## Added
- Added possibility to trigger USER_IDLE and USER_ACTIVE events in Portal


## [1.4.6] - 2025-07-17

## Fixed
- ConfirmButtonPressedEvent wasn't working in CycleCount and Consolidation
- Fixed a bug where the app wasn't starting due to a corrupt store state

## Changed

- Changed translations to highlight main words (ex.: Report problem --> Report Problem).
- Removed logo and mesh in WorkstationSelectionView
- Translate station text in portal user menu

## Updated

- Updated vite because of vulnerabilities.

## [1.4.5] - 2025-01-27

## Fixed

- Do not show empty compartment confirmation when a problem with abort is selected.
- Fixed the incorrect quantity after creating a scan in cycle count
- Correctly disable buttons and editors when a problem with abort is selected in cycle count.

## [1.4.4] - 2025-01-20

## Fixed

- Fixed disconnect handling for websockets

## [1.4.3] - 2024-12-04

## Updated

- Updated error messages for rovoflex

## [1.4.2] - 2024-12-04

## Fixed

- Fixed wrong handling of PickScreenError

## [1.4.1] - 2024-11-13

## Added

- Added Ctrl+K portal search functionality when app is deployed

## Updated

- Updated error messages for rovoflex
- Updated WebComponents to 5.3.9
- Updated Sass api to modern

### Fixed

- Fixed not working fallback handling for Bfg V2 permission call

## [1.4.0] - 2024-10-15

### Changed

- Changed image of monitor step in RovoFlexInstructionView

### Added

- Added support for monitor position error (PickScreenError) to rovoflex
- Added animation to visualize monitor position error

### Fixed

- Fixed rare possibility of rovoflex getting stuck after robot turns off with error

### Updated

- Updated TgwWebComponents
- Updated vue-tsc

## [1.3.0] - 2024-09-24

### Added

- BFG v2 permission call added (V1 call is fallback if used BFG does not support V2 yet)

### Fixed

- Router import in main

## [1.2.0] - 2024-07-29

### Added

- New title for PickCenterOneTsView that displays current actions
- New translations for PCOTS View title
- Support for multi oauth gateway environments

### Fixed

- Wrong translations in German
- Fixed vulnerability in dependencies
- Fixed error where WebSocketCreator was not using the correct env variables

### Changed

- Changed previous title of PickCenterOneTsView to a subtitle
- Changed customData property name to additionalData to match API
- env loading improved with relative paths

### Removed

- Removed consolidation actions from ConsolidationActionBar and added them to new PickCenterOneTsView title
- Removed RecountTitle component

## [1.1.0] - 2024-05-27

### Added

- New optional property for ProblemDefinition sendToReject(None, Source, Target, Both) to customize problem responses
- New images for Rovoflex processes
- New env parameter VITE_APP_BACKEND_ADAPTER to configure backend connection
- New property switchFromError added to RovoflexSwitch header

### Fixed

- ProblemClassificationButton: error where clicking the icon did not visualy select the button
- CompartmentCard: design errors fixed
- ScanHintDialog: design errors fixed
- Rovoflex: moveRobotToHome view design errors fixed

### Updated

- GitOps definitions for podman on OracleLinux8 and OracleLinux9
- TgwWebComponents to version 5.0.2
- Adjusted LoadCarrierItemDetails to support longer values and adds line-break for multiple elements if text is too long
- MoveRobotToHomeView now uses RovoflexSwitchHeader to unify header design of Rovoflex views

### Changed

- Replaced TextWithHighlightedParts with TgwHighlighted
- Old backEnd connection env parameter VITE_APP_CILOG_ADAPTER still supported, but now fallback if new parameter VITE_APP_BACKEND_ADAPTER is not used

### Removed

- Removed workaround for RovoflexProblem dialog because of webcomponents fix
- Removed icon color change behavior from IconButton for disabled buttons because TgwButton already handles it

## [1.0.0] - 2024-05-13

### Fixed

- DeleteCountMessageBox design errors

### Updated

- Updated to TgwWebComponents 4.2.14
- Updated various translations

### Changed

- Replaced as much element-plus components as possible with TgwWebComponents
- Changed display of item number to show item id
- Changed display of item name instead of description

### Removed
- Removed highlighting of quantity display > 1 in compartments

