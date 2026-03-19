import SwiftUI

struct SettingsView: View {

    @AppStorage("defaultUnit") private var defaultUnit = "lbs"

    @State private var showExportAlert = false
    @State private var showImportAlert = false

    var body: some View {
        NavigationStack {
            Form {
                // MARK: - Preferences
                Section {
                    HStack {
                        Label("Default Unit", systemImage: "scalemass.fill")
                            .foregroundColor(.textPrimary)

                        Spacer()

                        Picker("", selection: $defaultUnit) {
                            Text("LBS").tag("lbs")
                            Text("KG").tag("kg")
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 140)
                    }
                } header: {
                    Text("Preferences")
                        .foregroundColor(.muted)
                }
                .listRowBackground(Color.card)

                // MARK: - Data
                Section {
                    Button {
                        showExportAlert = true
                    } label: {
                        Label("Export Data", systemImage: "square.and.arrow.up")
                            .foregroundColor(.textPrimary)
                    }

                    Button {
                        showImportAlert = true
                    } label: {
                        Label("Import Data", systemImage: "square.and.arrow.down")
                            .foregroundColor(.textPrimary)
                    }
                } header: {
                    Text("Data")
                        .foregroundColor(.muted)
                }
                .listRowBackground(Color.card)

                // MARK: - About
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 10) {
                            Image(systemName: "dumbbell.fill")
                                .font(.title2)
                                .foregroundColor(.accent)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("LiftLog")
                                    .font(.headline)
                                    .foregroundColor(.textPrimary)
                                Text("Version 1.0")
                                    .font(.caption)
                                    .foregroundColor(.muted)
                            }
                        }

                        Text("A simple, fast workout logger inspired by Apple Notes. Track your lifts, monitor progress, and build strength.")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                            .padding(.top, 4)
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text("About")
                        .foregroundColor(.muted)
                }
                .listRowBackground(Color.card)
            }
            .scrollContentBackground(.hidden)
            .background(Color.background)
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Export Data", isPresented: $showExportAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Data export will be available in a future update.")
            }
            .alert("Import Data", isPresented: $showImportAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Data import will be available in a future update.")
            }
        }
    }
}

#Preview {
    SettingsView()
        .preferredColorScheme(.dark)
}
