import SwiftUI

struct SettingsView: View {

    @AppStorage("defaultUnit") private var defaultUnit = "lbs"
    @AppStorage("aiEnabled") private var aiEnabled = true

    // Personal info for AI recommendations
    @AppStorage("userBodyWeight") private var bodyWeight = ""
    @AppStorage("userExperience") private var experience = "intermediate"
    @AppStorage("userTrainingGoal") private var trainingGoal = "strength"
    @AppStorage("userTrainingDays") private var trainingDays = 4
    @AppStorage("userNotes") private var userNotes = ""

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

                // MARK: - Smart Recommendations
                Section {
                    Toggle(isOn: $aiEnabled) {
                        Label("Smart Recommendations", systemImage: "brain")
                            .foregroundColor(.textPrimary)
                    }
                    .tint(.accent)

                    if aiEnabled {
                        Text("Suggests weight, reps, and deloads based on your training history.")
                            .font(.caption)
                            .foregroundColor(.muted)
                    }
                } header: {
                    Text("AI Coach")
                        .foregroundColor(.muted)
                }
                .listRowBackground(Color.card)

                // MARK: - Personal Info
                Section {
                    HStack {
                        Label("Body Weight", systemImage: "figure.stand")
                            .foregroundColor(.textPrimary)
                        Spacer()
                        TextField("e.g. 180", text: $bodyWeight)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .foregroundColor(.textSecondary)
                            .frame(width: 80)
                        Text(defaultUnit)
                            .foregroundColor(.muted)
                            .font(.subheadline)
                    }

                    HStack {
                        Label("Experience", systemImage: "chart.bar.fill")
                            .foregroundColor(.textPrimary)
                        Spacer()
                        Picker("", selection: $experience) {
                            Text("Beginner").tag("beginner")
                            Text("Intermediate").tag("intermediate")
                            Text("Advanced").tag("advanced")
                        }
                        .tint(.textSecondary)
                    }

                    HStack {
                        Label("Goal", systemImage: "target")
                            .foregroundColor(.textPrimary)
                        Spacer()
                        Picker("", selection: $trainingGoal) {
                            Text("Strength").tag("strength")
                            Text("Hypertrophy").tag("hypertrophy")
                            Text("Endurance").tag("endurance")
                            Text("General Fitness").tag("general")
                        }
                        .tint(.textSecondary)
                    }

                    HStack {
                        Label("Days / Week", systemImage: "calendar")
                            .foregroundColor(.textPrimary)
                        Spacer()
                        Picker("", selection: $trainingDays) {
                            ForEach(1...7, id: \.self) { day in
                                Text("\(day)").tag(day)
                            }
                        }
                        .tint(.textSecondary)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Label("Injuries / Notes", systemImage: "note.text")
                            .foregroundColor(.textPrimary)
                        TextField("e.g. bad left shoulder, avoid overhead", text: $userNotes, axis: .vertical)
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                            .lineLimit(2...4)
                    }
                } header: {
                    Text("About You")
                        .foregroundColor(.muted)
                } footer: {
                    Text("Helps the AI tailor recommendations to your level and goals.")
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
