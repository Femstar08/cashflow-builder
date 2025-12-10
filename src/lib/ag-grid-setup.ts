/**
 * AG Grid Module Registration
 * 
 * This file registers AG Grid modules to avoid the "No AG Grid modules are registered" error.
 * Import this file once in your application, typically in a root layout or provider component.
 */

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

